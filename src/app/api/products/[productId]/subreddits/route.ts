import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = withMiddleware(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  try {
    const { productId } = params;
    
    if (!productId) {
      return new NextResponse(
        JSON.stringify({ error: "Product ID is required" }), 
        { status: 400 }
      );
    }

    const subreddits = await prisma.subredditSuggestion.findMany({
      where: { 
        productId: productId // Ensure productId is a string
      },
      orderBy: { 
        relevanceScore: 'desc' 
      }
    });

    // Format the response data
    const formattedSubreddits = subreddits.map(subreddit => ({
      id: subreddit.id,
      name: subreddit.name,
      title: subreddit.title,
      description: subreddit.description,
      memberCount: Number(subreddit.memberCount),
      url: subreddit.url,
      relevanceScore: Number(subreddit.relevanceScore),
      matchReason: subreddit.matchReason || '',
      isMonitored: Boolean(subreddit.isMonitored),
      productId: subreddit.productId,
      createdAt: subreddit.createdAt,
      updatedAt: subreddit.updatedAt
    }));

    return NextResponse.json(formattedSubreddits);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch subreddits",
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Add PATCH endpoint to update isMonitored status
export const PATCH = withMiddleware(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  try {
    const { productId } = params;
    const body = await req.json();
    const { subredditId, isMonitored } = body;

    if (!productId || !subredditId) {
      return new NextResponse(
        JSON.stringify({ error: "Product ID and Subreddit ID are required" }), 
        { status: 400 }
      );
    }

    const updatedSubreddit = await prisma.subredditSuggestion.update({
      where: {
        id: subredditId,
        productId: productId
      },
      data: {
        isMonitored
      }
    });

    return NextResponse.json(updatedSubreddit);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update subreddit",
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
