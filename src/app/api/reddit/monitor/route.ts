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
    
    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      startUrls: [{
        url: `https://www.reddit.com/r/${subreddit.toLowerCase()}/`,
        method: "GET"
      }],
      maxItems: postsCount,
      maxPostCount: postsCount,
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

    console.log(`Found ${posts?.length} valid posts for r/${subreddit}`);
    return posts || [];
  } catch (error) {
    console.error(`Error in getRedditPosts for ${subreddit}:`, error);
    return [];
  }
}

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    let { subreddits, postsPerSubreddit, productId } = await req.json();
    
    // Get posts from each subreddit
    const allPosts = await Promise.all(
      subreddits.map(subreddit => getRedditPosts(subreddit, Math.max(MIN_POSTS_PER_SUBREDDIT, postsPerSubreddit)))
    );

    // Flatten and validate posts
    const validPosts = allPosts.flat().filter(Boolean);
    
    if (validPosts.length === 0) {
      throw new Error(`No valid posts found from subreddits: ${subreddits.join(', ')}`);
    }

    // Score posts based on product keywords
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    const scoredPosts = validPosts.map(post => {
      const postText = `${post.title} ${post.text}`.toLowerCase();
      const matchedKeywords = product.keywords.filter(keyword => 
        postText.includes(keyword.toLowerCase())
      );

      return {
        ...post,
        productId,
        engagement: matchedKeywords.length > 0 ? 'HOT' : 'unseen',
        fit: matchedKeywords.length > 0 ? 80 : 40,
        authenticity: post.upVotes > 10 ? 75 : 50,
        lead: matchedKeywords.length > 0 ? 90 : 30,
        isFavorited: false,
        isReplied: false
      };
    });

    // Sort by relevance and limit to requested number
    scoredPosts.sort((a, b) => b.lead - a.lead);
    const postsToSave = scoredPosts.slice(0, postsPerSubreddit * subreddits.length);

    // Save to database
    const savedPosts = await prisma.redditPost.createMany({
      data: postsToSave,
      skipDuplicates: true
    });

    return NextResponse.json({ 
      success: true, 
      postsFound: validPosts.length,
      savedCount: savedPosts.count,
      bySubreddit: Object.fromEntries(
        subreddits.map(subreddit => [
          subreddit,
          postsToSave.filter(p => p.subreddit.toLowerCase() === subreddit.toLowerCase()).length
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
