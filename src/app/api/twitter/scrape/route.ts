// src/app/api/twitter/scrape/route.ts

import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwitterPostData, ProcessedTweet } from '@/types/twitter';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN || '',
});

// Utility function to calculate lead score
function calculateLeadScore(tweet: any, productKeywords: string[]): number {
  if (!tweet.text || !productKeywords.length) return 0;
  
  const tweetText = tweet.text.toLowerCase();
  const keywordMatches = productKeywords.filter(keyword => 
    tweetText.includes(keyword.toLowerCase())
  ).length;
  
  const engagementScore = (
    (tweet.retweetCount || 0) * 2 + 
    (tweet.likeCount || 0) + 
    (tweet.replyCount || 0) * 3
  ) / 100;
  
  return Math.min(
    ((keywordMatches / productKeywords.length) * 0.7 + engagementScore * 0.3) * 100,
    100
  );
}

function mapTwitterResponse(tweet: any, productId: string, productKeywords: string[]): ProcessedTweet {
  return {
    twitterId: tweet.id,
    text: tweet.fullText || tweet.text,
    url: tweet.url,
    author: tweet.author.name,
    authorUsername: tweet.author.userName,
    createdAt: new Date(tweet.createdAt),
    productId,
    engagement: 'unseen',
    fit: 0,
    authenticity: 0,
    lead: calculateLeadScore(tweet, productKeywords),
    isFavorited: false,
    isReplied: false,
    latestReply: null,
    replyCount: tweet.replyCount || 0,
    retweetCount: tweet.retweetCount || 0,
    likeCount: tweet.likeCount || 0,
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { productId, tweetCount = 10 } = body;

    // Get product keywords
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { keywords: true }
    });

    if (!product?.keywords?.length) {
      return new NextResponse(
        JSON.stringify({ error: 'No keywords found for product' }), 
        { status: 400 }
      );
    }

    console.log('Starting Apify actor with:', {
      searchTerms: product.keywords,
      sort: 'Latest',
      maxItems: Number(tweetCount),
      startUrls: [],
      twitterHandles: []
    });

    const run = await apifyClient.actor("apidojo/twitter-scraper-lite").call({
      searchTerms: product.keywords,
      sort: 'Latest',
      maxItems: Number(tweetCount),
      startUrls: [],
      twitterHandles: []
    });

    const { items = [] } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`Retrieved ${items.length} tweets from Apify`);

    const tweets = await Promise.all(
      items.map(async (tweet: any) => {
        try {
          const tweetData = mapTwitterResponse(tweet, productId, product.keywords);
          return prisma.tweet.upsert({
            where: { twitterId: tweetData.twitterId },
            create: tweetData,
            update: tweetData,
          });
        } catch (error) {
          console.error('Error processing tweet:', error);
          return null;
        }
      })
    );

    const validTweets = tweets.filter((t): t is NonNullable<typeof t> => t !== null);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${validTweets.length} tweets`
    });

  } catch (error) {
    console.error('Twitter scraping error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to scrape tweets', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500 }
    );
  }
} 