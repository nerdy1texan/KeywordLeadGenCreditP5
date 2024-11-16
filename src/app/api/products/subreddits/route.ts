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
    const description = req.nextUrl.searchParams.get("description");
    const productId = req.nextUrl.searchParams.get("productId");
    
    if (!description || !productId) {
      return NextResponse.json(
        { error: "Description and Product ID are required" }, 
        { status: 400 }
      );
    }

    // First get existing subreddits
    const existingSubreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    const existingNames = new Set(existingSubreddits.map(sub => sub.name.toLowerCase()));

    // Extract keywords and find new subreddits
    const keywords = await extractKeywords(description);
    console.log('Searching with keywords:', keywords);

    const subreddits = await getSubredditsFromApify(keywords, productId);
    
    // Store new subreddits in database
    if (subreddits.length > 0) {
      try {
        // Filter out subreddits that already exist
        const newSubreddits = subreddits.filter(
          sub => !existingNames.has(sub.name.toLowerCase())
        );

        if (newSubreddits.length > 0) {
          // Create new subreddits one by one
          const createdSubreddits = await Promise.all(
            newSubreddits.map(subreddit =>
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

          const successfulCreations = createdSubreddits.filter(Boolean);
          console.log(`Successfully processed ${successfulCreations.length} new subreddits`);
        } else {
          console.log('No new subreddits to add');
        }
      } catch (error) {
        console.error('Error processing subreddits:', error);
      }
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

// Helper function to calculate relevance score
function calculateRelevanceScore(subreddit: ApifySubredditResponse, keywords: string[]): number {
  let score = 70; // Base score
  let relevanceHits = 0;
  const totalKeywords = keywords.length;
  
  // Check title and description for keyword matches
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const titleLower = subreddit.title.toLowerCase();
    const descLower = subreddit.description?.toLowerCase() || '';
    
    // Direct matches in title are very important
    if (titleLower.includes(keywordLower)) {
      score += 15;
      relevanceHits++;
    }
    
    // Matches in description are good too
    if (descLower.includes(keywordLower)) {
      score += 10;
      relevanceHits++;
    }
  });

  // Calculate keyword match percentage
  const matchPercentage = (relevanceHits / totalKeywords) * 100;
  
  // Bonus for high member count (we want active communities)
  if (subreddit.numberOfMembers > 1000000) score += 10;
  else if (subreddit.numberOfMembers > 100000) score += 5;
  
  // Penalty for very small communities
  if (subreddit.numberOfMembers < 10000) score -= 20;
  
  // If less than 30% of keywords match, significantly reduce score
  if (matchPercentage < 30) score -= 30;
  
  // Cap the score
  return Math.min(100, Math.max(0, score));
}

// Helper function to search for subreddits using Apify
async function getSubredditsFromApify(keywords: string[], productId: string) {
  try {
    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      searches: keywords,
      type: "community", // Specifically search for communities
      sort: "relevance", // Sort by relevance to get most relevant communities
      maxItems: 100, // Get more items to filter down to best matches
      maxCommunitiesCount: 20, // Limit to 20 most relevant communities
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      searchCommunities: true,
      searchPosts: false, // Disable post search
      time: "all"
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Filter and format subreddits
    const subreddits = (items as unknown[])
      .filter((item): item is ApifySubredditResponse => {
        if (!isApifySubredditResponse(item)) return false;
        return (
          item.dataType === 'community' && 
          typeof item.numberOfMembers === 'number' &&
          item.numberOfMembers >= 1000
        );
      })
      .map((item) => ({
        name: item.title,
        title: item.title,
        description: item.description || '',
        memberCount: item.numberOfMembers,
        url: item.url,
        relevanceScore: calculateRelevanceScore(item, keywords),
        matchReason: `Relevant to: ${keywords.slice(0, 3).join(", ")}`,
        isMonitored: false,
        productId
      }));

    return subreddits
      .filter(sub => sub.relevanceScore >= 75)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);
  } catch (error) {
    console.error("Error in findRelevantSubreddits:", error);
    return [];
  }
} 