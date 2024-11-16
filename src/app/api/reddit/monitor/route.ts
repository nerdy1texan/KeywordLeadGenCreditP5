import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { ApifyClient } from 'apify-client';
import { type NextRequest, NextResponse } from "next/server";
import { type CreateRedditPost } from '@/types/product';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const MIN_POSTS_PER_SUBREDDIT = 10;

async function getRedditPosts(subreddit: string, postsCount: number) {
  try {
    console.log(`Starting Apify scrape for r/${subreddit} with count ${postsCount}`);
    
    const scrapeCount = Math.max(MIN_POSTS_PER_SUBREDDIT, postsCount);
    
    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      startUrls: [{
        url: `https://www.reddit.com/r/${subreddit.toLowerCase()}/`,
        method: "GET"
      }],
      maxItems: scrapeCount * 2,
      maxPostCount: scrapeCount * 2,
      proxy: {
        useApifyProxy: true
      }
    });

    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Filter only post items and transform to match our schema
    const posts = dataset?.items?.filter(item => 
      item?.dataType === 'post' && 
      item?.id?.startsWith('t3_') && 
      item?.title && 
      item?.url
    ).map(post => ({
      redditId: post.parsedId || post.id.replace('t3_', ''),
      title: post.title?.trim() || '',
      text: post.body?.trim() || '',
      url: post.url,
      subreddit: post.parsedCommunityName || post.communityName?.replace('r/', ''),
      author: post.username || 'Anonymous',
      createdAt: new Date(post.createdAt),
      productId: '',
      engagement: 'unseen',
      fit: 0,
      authenticity: 0,
      lead: 0,
      isFavorited: false,
      isReplied: false
    })) as CreateRedditPost[];

    // Take exactly the number of posts requested (after ensuring we have enough valid ones)
    const limitedPosts = posts.slice(0, postsCount);

    console.log(`Found ${posts.length} total posts, using ${limitedPosts.length} posts for r/${subreddit}`);
    return limitedPosts;
  } catch (error) {
    console.error(`Error in getRedditPosts for ${subreddit}:`, error);
    return [];
  }
}

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    let { subreddits, postsPerSubreddit, productId } = await req.json();
    
    const totalPostsRequested = postsPerSubreddit;
    const postsPerSub = Math.ceil(totalPostsRequested / subreddits.length);
    
    console.log(`Requesting ${postsPerSub} posts from each of ${subreddits.length} subreddits`);

    // Get posts from each subreddit
    const allPosts = await Promise.all(
      subreddits.map(subreddit => getRedditPosts(subreddit, postsPerSub))
    );

    // Flatten and validate posts
    const validPosts = allPosts.flat().filter(Boolean);
    
    if (validPosts.length === 0) {
      throw new Error(`No valid posts found from subreddits: ${subreddits.join(', ')}`);
    }

    // Score posts with more lenient criteria
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    const scoredPosts = validPosts.map(post => {
      const postText = `${post.title} ${post.text}`.toLowerCase();
      const matchedKeywords = product.keywords.filter(keyword => 
        postText.includes(keyword.toLowerCase())
      );

      // More lenient scoring
      return {
        ...post,
        productId,
        engagement: matchedKeywords.length > 0 ? 'HOT' : 'unseen',
        fit: matchedKeywords.length > 0 ? 70 : 30, // Lowered thresholds
        authenticity: 50, // Base authenticity score
        lead: matchedKeywords.length > 0 ? 75 : 25, // Lowered thresholds
        isFavorited: false,
        isReplied: false
      };
    });

    // Distribute posts equally between subreddits
    const postsToSave = subreddits.reduce((acc, subreddit) => {
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

    // Return detailed response
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

  } catch (error: any) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
});
