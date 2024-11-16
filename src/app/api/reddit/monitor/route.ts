import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { ApifyClient } from 'apify-client';
import { type NextRequest, NextResponse } from "next/server";
import { type RedditPostData, type ProcessedRedditPost } from '@/types/reddit';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function getRedditPosts(subreddit: string, limit: number): Promise<ProcessedRedditPost[]> {
  try {
    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      startUrls: [{
        url: `https://www.reddit.com/r/${subreddit.toLowerCase()}/`,
        method: "GET"
      }],
      maxItems: limit * 2,
      maxPostCount: limit * 2,
      proxy: {
        useApifyProxy: true
      }
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    return ((items as unknown) as RedditPostData[])
      .filter((item): item is RedditPostData => 
        item?.id?.startsWith('t3_') &&
        typeof item.title === 'string' &&
        typeof item.communityName === 'string'
      )
      .map((post) => ({
        redditId: post.parsedId || post.id.replace('t3_', ''),
        title: post.title?.trim() || '',
        text: post.body?.trim() || '',
        url: post.url || '',
        subreddit: post.parsedCommunityName || post.communityName?.replace('r/', ''),
        author: '',
        createdAt: new Date(post.createdAt),
        productId: '',
        engagement: 'low',
        fit: 0,
        authenticity: 0,
        lead: 0,
        isFavorited: false,
        isReplied: false,
        latestReply: null
      }));
  } catch (error) {
    console.error(`Error in getRedditPosts for ${subreddit}:`, error);
    return [];
  }
}

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    const { subreddits, postsPerSubreddit, productId } = await req.json() as {
      subreddits: string[];
      postsPerSubreddit: number;
      productId: string;
    };
    
    const totalPostsRequested = postsPerSubreddit;
    const postsPerSub = Math.ceil(totalPostsRequested / subreddits.length);
    
    // Get posts from each subreddit
    const allPosts = await Promise.all(
      subreddits.map(subreddit => getRedditPosts(subreddit, postsPerSub))
    );

    // Flatten and validate posts
    const validPosts = allPosts.flat().filter((post): post is ProcessedRedditPost => !!post);
    
    // Get product for scoring
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Score posts
    const scoredPosts = validPosts.map(post => {
      const matchedKeywords = product.keywords.filter(keyword =>
        post.title.toLowerCase().includes(keyword.toLowerCase()) ||
        post.text.toLowerCase().includes(keyword.toLowerCase())
      );

      return {
        ...post,
        productId,
        lead: matchedKeywords.length * 25
      };
    });

    // Group by subreddit and take top posts
    const postsToSave = subreddits.reduce<ProcessedRedditPost[]>((acc, subreddit) => {
      const subredditPosts = scoredPosts
        .filter(post => post.subreddit.toLowerCase() === subreddit.toLowerCase())
        .sort((a, b) => b.lead - a.lead)
        .slice(0, postsPerSub);
      
      return [...acc, ...subredditPosts];
    }, []);

    // Ensure we have exactly the requested number of posts
    const finalPosts = postsToSave.slice(0, totalPostsRequested);

    // Save posts to database
    const savedPosts = await prisma.$transaction(async (tx) => {
      const existingPosts = await tx.redditPost.findMany({
        where: {
          redditId: {
            in: finalPosts.map(post => post.redditId)
          }
        },
        select: {
          redditId: true
        }
      });

      const existingIds = new Set(existingPosts.map(p => p.redditId));
      const newPosts = finalPosts.filter(post => !existingIds.has(post.redditId));

      if (newPosts.length === 0) {
        return { count: 0 };
      }

      return await tx.redditPost.createMany({
        data: newPosts
      });
    });

    return NextResponse.json({ 
      success: true, 
      postsFound: validPosts.length,
      savedCount: savedPosts.count,
      requestedCount: totalPostsRequested,
      bySubreddit: Object.fromEntries(
        subreddits.map(subreddit => [
          subreddit,
          finalPosts.filter(p => p.subreddit.toLowerCase() === subreddit.toLowerCase()).length
        ])
      )
    });

  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
});
