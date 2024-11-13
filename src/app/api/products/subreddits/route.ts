import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { ApifyClient } from 'apify-client';
import { OpenAI } from 'openai';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    const description = req.nextUrl.searchParams.get("description");
    const productId = req.nextUrl.searchParams.get("productId");
    
    if (!description || !productId) {
      return new NextResponse("Description and Product ID are required", { status: 400 });
    }

    // First get existing subreddits
    const existingSubreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    // Extract keywords and find new subreddits
    const keywords = await extractKeywords(description);
    console.log('Searching with keywords:', keywords);

    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      searches: keywords.map(k => `${k} subreddit`),
      maxItems: 100,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Score and filter subreddits
    const scoredSubreddits = items
      .map(item => ({
        ...item,
        relevanceScore: calculateRelevanceScore(item, keywords)
      }))
      .filter(item => item.relevanceScore >= 75)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    // Transform and filter new results
    const newSubreddits = scoredSubreddits
      .filter(item => 
        item.dataType === "community" &&
        item.numberOfMembers >= 1000 &&
        !item.over18 &&
        // Filter out existing subreddits
        !existingSubreddits.some(existing => 
          existing.name.toLowerCase() === (item.displayName || item.title.replace(/^r\//, '')).toLowerCase()
        )
      )
      .map(item => ({
        name: item.displayName || item.title.replace(/^r\//, ''),
        title: item.title || item.displayName,
        description: item.description || "",
        memberCount: parseInt(item.numberOfMembers) || 0,
        url: item.url || `https://reddit.com/r/${item.displayName || item.title.replace(/^r\//, '')}`,
        relevanceScore: calculateRelevanceScore(item, keywords),
        matchReason: `Relevant to: ${keywords.slice(0, 3).join(", ")}`,
        isMonitored: false,
        productId
      }));

    // Store new subreddits one by one to handle duplicates
    for (const subreddit of newSubreddits) {
      try {
        await prisma.subredditSuggestion.create({
          data: subreddit
        });
      } catch (error) {
        // Ignore duplicate key errors
        console.log(`Skipping duplicate subreddit: ${subreddit.name}`);
      }
    }

    // Get all subreddits after adding new ones
    const allSubreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    return NextResponse.json(allSubreddits);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch subreddits" }), 
      { status: 500 }
    );
  }
});

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
function calculateRelevanceScore(subreddit: any, keywords: string[]): number {
  let score = 70; // Base score
  let relevanceHits = 0;
  const totalKeywords = keywords.length;
  
  // Check title and description for keyword matches
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    const titleLower = subreddit.title?.toLowerCase() || '';
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