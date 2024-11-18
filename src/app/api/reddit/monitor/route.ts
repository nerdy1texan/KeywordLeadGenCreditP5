import { Prisma } from '@prisma/client';
import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { ApifyClient } from 'apify-client';
import { type NextRequest, NextResponse } from "next/server";
import { type RedditPostData, type ProcessedRedditPost } from '@/types/reddit';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

function calculateLeadScore(post: RedditPostData, keywords: string[]): number {
  let score = 0;
  
  keywords.forEach(keyword => {
    // Check title
    const titleMatches = (post.title?.toLowerCase() || '').split(keyword.toLowerCase()).length - 1;
    score += titleMatches * 50; // 50 points per keyword match in title
    
    // Check body
    const bodyMatches = (post.body?.toLowerCase() || '').split(keyword.toLowerCase()).length - 1;
    score += bodyMatches * 25; // 25 points per keyword match in body
  });

  return score;
}

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    const { subreddits, postsPerSubreddit, productId } = await req.json() as {
      subreddits: string[];
      postsPerSubreddit: number;
      productId: string;
    };

    // Get subreddit URLs from the database
    const subredditData = await prisma.subredditSuggestion.findMany({
      where: {
        name: {
          in: subreddits
        },
        productId: productId
      },
      select: {
        url: true
      }
    });

    // Calculate total posts needed while respecting Apify's minimum
    const totalPosts = Math.max(10, postsPerSubreddit);

    // Create startUrls using the actual URLs from the database
    const startUrls = subredditData.map(subreddit => ({
      url: subreddit.url.replace('www.reddit.com', 'old.reddit.com') + 'new/',
      method: "GET"
    }));

    console.log("Starting Apify run with URLs:", startUrls);

    // Single Apify run with correct parameters
    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      startUrls,
      maxItems: totalPosts * subreddits.length,
      maxPostCount: totalPosts * subreddits.length,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      skipComments: true,
      skipUserPosts: false,
      skipCommunity: true,
      debugLog: true
    });

    console.log("Apify run started:", run.id);

    // Wait for and get results
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    console.log("Raw Apify results:", JSON.stringify(items, null, 2));

    // Get product for keyword filtering
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Process and validate posts
    const validPosts = (items as unknown[]).filter((item): item is RedditPostData => 
      item !== null &&
      typeof item === 'object' &&
      'id' in item &&
      'title' in item &&
      'communityName' in item
    );

    console.log("Valid posts found:", validPosts.length);

    // Create processed posts
    const processedPosts = validPosts.map((post): ProcessedRedditPost => ({
      redditId: post.parsedId || post.id.replace('t3_', ''),
      title: post.title?.trim() || '',
      text: post.body?.trim() || '',
      url: post.url || '',
      subreddit: post.parsedCommunityName || post.communityName?.replace('r/', ''),
      author: post.author || '',
      createdAt: new Date(post.createdAt),
      productId,
      engagement: 'unseen',
      fit: 0,
      authenticity: 0,
      lead: calculateLeadScore(post, product.keywords),
      isFavorited: false,
      isReplied: false,
      latestReply: null
    }));

    // Sort by lead score and take top posts
    const scoredPosts = processedPosts
      .sort((a, b) => b.lead - a.lead)
      .slice(0, totalPosts);

    console.log("Final scored posts:", scoredPosts.length);

    // Save posts to database
    if (scoredPosts.length > 0) {
      for (const post of scoredPosts) {
        try {
          await prisma.redditPost.create({
            data: post
          });
        } catch (error) {
          // Ignore duplicate key errors
          if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
            throw error;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${scoredPosts.length} posts`
    });

  } catch (error) {
    console.error("Reddit monitoring error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
});
