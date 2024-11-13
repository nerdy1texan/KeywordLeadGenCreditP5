import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = withMiddleware(async (req: NextRequest, { params }) => {
  try {
    const productId = params.productId;
    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const subreddits = await prisma.subredditSuggestion.findMany({
      where: { productId },
      orderBy: { relevanceScore: 'desc' }
    });

    const formattedSubreddits = subreddits.map(subreddit => ({
      ...subreddit,
      memberCount: parseInt(subreddit.memberCount.toString()) || 0,
      relevanceScore: parseFloat(subreddit.relevanceScore.toString()) || 0
    }));

    return NextResponse.json(formattedSubreddits);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch subreddits" }), 
      { status: 500 }
    );
  }
});
