import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { subDays, subMonths, subYears } from "date-fns";

export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const searchParams = req.nextUrl.searchParams;
    const subreddit = searchParams.get('subreddit');
    const timeRange = searchParams.get('timeRange') || 'all';
    
    let dateFilter = {};
    switch (timeRange) {
      case 'day':
        dateFilter = { gte: subDays(new Date(), 1) };
        break;
      case 'week':
        dateFilter = { gte: subDays(new Date(), 7) };
        break;
      case 'month':
        dateFilter = { gte: subMonths(new Date(), 1) };
        break;
      case 'year':
        dateFilter = { gte: subYears(new Date(), 1) };
        break;
    }

    const posts = await prisma.redditPost.findMany({
      where: {
        productId,
        ...(subreddit && subreddit !== 'all' ? { subreddit } : {}),
        ...(timeRange !== 'all' ? { createdAt: dateFilter } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
} 