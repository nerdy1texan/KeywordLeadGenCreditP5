import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { ApifyClient } from 'apify-client';
import { type NextRequest, NextResponse } from "next/server";
import { type CreateRedditPost } from '@/types/product';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    let { subreddits, postsPerSubreddit, productId } = await req.json();
    
    // Enforce minimum of 10 posts total
    if (postsPerSubreddit * subreddits.length < 10) {
      postsPerSubreddit = Math.ceil(10 / subreddits.length);
    }

    console.log('Starting monitoring job:', { subreddits, postsPerSubreddit, productId });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    // Run scraping jobs for each subreddit
    const allPosts = [];
    for (const subreddit of subreddits) {
      const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
        startUrls: [{
          url: `https://www.reddit.com/r/${subreddit.toLowerCase()}/`,
          method: "GET"
        }],
        maxItems: postsPerSubreddit + 5, // Request extra to ensure we get enough
        maxPostCount: postsPerSubreddit + 5,
        proxy: {
          useApifyProxy: true
        }
      });

      // Wait for and collect posts
      const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
      if (dataset?.items?.length) {
        allPosts.push(...dataset.items);
      }
    }

    // Score and categorize posts
    const scoredPosts = allPosts.map(post => {
      if (!post?.title) return null;
      
      const postText = `${post.title} ${post.selftext || ''}`.toLowerCase();
      const matchedKeywords = product.keywords.filter(keyword => 
        postText.includes(keyword.toLowerCase())
      );

      return {
        ...post,
        relevanceScore: matchedKeywords.length,
        matchedKeywords
      };
    }).filter(Boolean);

    // Sort by relevance score
    scoredPosts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Mark top 30% as HOT leads
    const hotLeadCount = Math.max(Math.ceil(scoredPosts.length * 0.3), 3); // At least 3 HOT leads
    
    // Transform posts for saving
    console.log("Raw post data:", scoredPosts[0]); // Log first post to see structure
    const postsToSave: CreateRedditPost[] = scoredPosts.map((post, index) => {
      const mappedPost = {
        redditId: post.id,
        title: post.title || "",
        text: post.selftext || "",
        url: post.url || `https://reddit.com${post.permalink}`,
        subreddit: post.subreddit || "",
        author: post.author || "",
        createdAt: new Date(post.created_utc * 1000),
        productId,
        engagement: index < hotLeadCount ? 'HOT' : 'Engagement',
        fit: index < hotLeadCount ? 80 : 40,
        authenticity: index < hotLeadCount ? 75 : 50,
        lead: index < hotLeadCount ? 90 : 30,
        isFavorited: false,
        isReplied: false
      };
      
      console.log("Mapped post:", mappedPost); // Log the transformed data
      return mappedPost;
    });

    // Save posts
    const savedPosts = await Promise.all(
      postsToSave.map(post => 
        prisma.redditPost.upsert({
          where: { redditId: post.redditId },
          update: {
            title: post.title,
            text: post.text,
            url: post.url,
            engagement: post.engagement,
            fit: post.fit,
            authenticity: post.authenticity,
            lead: post.lead
          },
          create: post
        }).catch(error => {
          console.error(`Failed to save post ${post.redditId}:`, error);
          return null;
        })
      )
    );

    const successfulSaves = savedPosts.filter(Boolean);
    const resultsBySubreddit = successfulSaves.reduce((acc: any, post: any) => {
      acc[post.subreddit] = {
        total: (acc[post.subreddit]?.total || 0) + 1,
        hot: (acc[post.subreddit]?.hot || 0) + (post.engagement === 'HOT' ? 1 : 0)
      };
      return acc;
    }, {});

    console.log('Save results:', {
      total: postsToSave.length,
      saved: successfulSaves.length,
      bySubreddit: resultsBySubreddit
    });

    return NextResponse.json({ 
      success: true,
      postsFound: postsToSave.length,
      savedCount: successfulSaves.length,
      postsBySubreddit: resultsBySubreddit
    });

  } catch (error: any) {
    console.error("Monitoring error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
});
