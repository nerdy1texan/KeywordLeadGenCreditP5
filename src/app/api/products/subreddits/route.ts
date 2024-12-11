// src/app/api/products/subreddits/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApifyClient } from 'apify-client';
import { OpenAI } from 'openai';
import { type ApifySubredditResponse, isApifySubredditResponse } from '@/types/apify';
import { type SubredditSuggestion } from '@prisma/client';

// Update the RouteHandler type
type RouteParams = { params: { productId: string } };

type RouteHandler = (
  req: NextRequest,
  context: RouteParams
) => Promise<NextResponse>;

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GET = async (req: NextRequest) => {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" }, 
        { status: 400 }
      );
    }

    // Get product with its keywords
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        keywords: true,
        name: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }

    // First get existing subreddits
    const existingSubreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    const existingNames = new Set(existingSubreddits.map(sub => sub.name.toLowerCase()));

    // Use stored keywords, excluding the product name
    const keywords = product.keywords.filter(k => k.toLowerCase() !== product.name.toLowerCase());
    console.log('Searching with stored keywords:', keywords);

    const subreddits = await getSubredditsFromApify(keywords, productId);
    
    // If we don't have enough subreddits, try with expanded keywords
    if (subreddits.length < 50) {
      const expandedKeywords = await expandKeywords(keywords);
      const additionalSubreddits = await getSubredditsFromApify(expandedKeywords, productId);
      
      // Combine and deduplicate subreddits
      const allSubreddits = [...subreddits, ...additionalSubreddits]
        .filter((sub, index, self) => 
          index === self.findIndex((t) => t.name.toLowerCase() === sub.name.toLowerCase())
        );
        
      // Store new subreddits
      await storeSubreddits(allSubreddits.filter(
        sub => !existingNames.has(sub.name.toLowerCase())
      ), productId);
    } else {
      // Store original subreddits if we have enough
      await storeSubreddits(subreddits.filter(
        sub => !existingNames.has(sub.name.toLowerCase())
      ), productId);
    }

    // Return updated list
    const allSubreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    return NextResponse.json(allSubreddits);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch subreddits" }, 
      { status: 500 }
    );
  }
};

// Helper function to store subreddits
async function storeSubreddits(subreddits: any[], productId: string) {
  if (subreddits.length > 0) {
    try {
      await Promise.all(
        subreddits.map(subreddit =>
          prisma.subredditSuggestion.create({
            data: {
              ...subreddit,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }).catch(e => {
            console.error(`Failed to create subreddit ${subreddit.name}:`, e);
            return null;
          })
        )
      );
    } catch (error) {
      console.error('Error storing subreddits:', error);
    }
  }
}

// Helper function to extract keywords using OpenAI
async function extractKeywords(description: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "Extract 3-5 most relevant search keywords for finding Reddit communities related to this product/service. Return only the keywords separated by commas, no explanation."
      },
      {
        role: "user",
        content: description
      }
    ],
    temperature: 0.3,
  });

  const keywords = completion.choices[0]?.message?.content?.split(',')
    .map(k => k.trim())
    .filter(Boolean) || [];
    
  return keywords;
}

// Modified relevance score calculation to be more lenient
function calculateRelevanceScore(subreddit: ApifySubredditResponse, keywords: string[]): number {
  let score = 60; // Lower base score to be more inclusive
  let relevanceHits = 0;
  const totalKeywords = keywords.length;
  
  // Check title and description for keyword matches
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const titleLower = subreddit.title.toLowerCase();
    const descLower = subreddit.description?.toLowerCase() || '';
    
    // Direct matches in title
    if (titleLower.includes(keywordLower)) {
      score += 12;
      relevanceHits++;
    }
    
    // Matches in description
    if (descLower.includes(keywordLower)) {
      score += 8;
      relevanceHits++;
    }
  });

  // More lenient member count scoring
  if (subreddit.numberOfMembers > 1000000) score += 15;
  else if (subreddit.numberOfMembers > 100000) score += 10;
  else if (subreddit.numberOfMembers > 10000) score += 5;
  
  // Smaller penalty for small communities
  if (subreddit.numberOfMembers < 5000) score -= 10;
  
  // More lenient keyword match percentage
  const matchPercentage = (relevanceHits / totalKeywords) * 100;
  if (matchPercentage < 20) score -= 20;
  
  return Math.min(100, Math.max(0, score));
}

// Modified subreddit extraction function
async function getSubredditsFromApify(keywords: string[], productId: string) {
  try {
    // Generate broader search terms
    const expandedKeywords = await expandKeywords(keywords);
    console.log('Expanded keywords:', expandedKeywords);

    // Split searches into batches to avoid timeout
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < expandedKeywords.length; i += batchSize) {
      batches.push(expandedKeywords.slice(i, i + batchSize));
    }

    let allSubreddits: any[] = [];
    
    // Process batches until we have enough subreddits or exhaust all keywords
    for (const batch of batches) {
      if (allSubreddits.length >= 50) break;

      const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
        searches: batch,
        type: "community",
        sort: "relevance",
        maxItems: 200, // Increased to get more results
        maxCommunitiesCount: 50, // Increased limit
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"]
        },
        searchCommunities: true,
        searchPosts: false,
        time: "all"
      });

      const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
      allSubreddits = [...allSubreddits, ...items];
      
      // Break if we have enough subreddits
      if (allSubreddits.length >= 200) break;
    }

    // Process and filter subreddits
    const processedSubreddits = allSubreddits
      .filter((item): item is ApifySubredditResponse => {
        if (!isApifySubredditResponse(item)) return false;
        return item.dataType === 'community' && typeof item.numberOfMembers === 'number';
      })
      // Remove duplicates based on subreddit name
      .filter((item, index, self) => 
        index === self.findIndex((t) => t.title.toLowerCase() === item.title.toLowerCase())
      )
      .map((item) => ({
        name: item.title,
        title: item.title,
        description: item.description || '',
        memberCount: item.numberOfMembers,
        url: item.url,
        relevanceScore: calculateRelevanceScore(item, keywords),
        matchReason: `Relevant to: ${expandedKeywords.slice(0, 3).join(", ")}`,
        isMonitored: false,
        productId
      }));

    // Sort by relevance score and member count
    return processedSubreddits
      .filter(sub => sub.relevanceScore >= 50) // More lenient score threshold
      .sort((a, b) => {
        // Prioritize relevance score but consider member count
        const scoreWeight = 0.7;
        const memberWeight = 0.3;
        const normalizedMemberScore = Math.min(100, (Math.log10(b.memberCount) / Math.log10(1000000)) * 100);
        const aScore = (a.relevanceScore * scoreWeight) + (normalizedMemberScore * memberWeight);
        const bScore = (b.relevanceScore * scoreWeight) + (normalizedMemberScore * memberWeight);
        return bScore - aScore;
      })
      .slice(0, 50);
  } catch (error) {
    console.error("Error in findRelevantSubreddits:", error);
    return [];
  }
}

// New helper function to expand keywords for better coverage
async function expandKeywords(originalKeywords: string[]): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "Generate 10-15 related search terms for finding Reddit communities, including broader topics and specific niches. Return only the terms separated by commas, no explanation."
      },
      {
        role: "user",
        content: `Original keywords: ${originalKeywords.join(", ")}`
      }
    ],
    temperature: 0.7,
  });

  const expandedTerms = completion.choices[0]?.message?.content?.split(',')
    .map(k => k.trim())
    .filter(Boolean) || [];
    
  return [...new Set([...originalKeywords, ...expandedTerms])];
} 