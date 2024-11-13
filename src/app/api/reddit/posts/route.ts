// /api/reddit/posts/route.ts

import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";
import { ApifyClient } from 'apify-client';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get monitored subreddits for the user
    // This would come from your database
    const subreddits = ["subreddit1", "subreddit2"]; // Replace with actual logic

    const run = await apifyClient.actor("trudax/reddit-scraper-lite").call({
      subreddits: subreddits,
      searchType: "posts",
      maxItems: 20,
      skipComments: true,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    });

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    // Process and score the posts
    const scoredPosts = items.map((post: any) => ({
      id: post.id,
      title: post.title,
      text: post.text || '',
      url: post.url,
      author: post.author,
      upvotes: post.score,
      comments: post.numComments,
      createdAt: post.created,
      subreddit: post.subreddit,
      fit: calculateFitScore(post),
      authenticity: calculateAuthenticityScore(post),
      relevance: calculateRelevanceScore(post),
      lead: calculateLeadScore(post)
    }));

    return NextResponse.json(scoredPosts);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch Reddit posts" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
