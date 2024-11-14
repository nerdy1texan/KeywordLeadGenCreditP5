import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export const PATCH = withMiddleware(async (
  req: NextRequest,
  { params }: { params: { subredditId: string } }
) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subredditId } = params;
    const { isMonitored } = await req.json();

    const subreddit = await prisma.subredditSuggestion.findFirst({
      where: {
        id: subredditId,
        product: {
          userId: session.user.id
        }
      }
    });

    if (!subreddit) {
      return new NextResponse(
        JSON.stringify({ error: "Subreddit not found or unauthorized" }), 
        { status: 404 }
      );
    }

    const updatedSubreddit = await prisma.subredditSuggestion.update({
      where: { id: subredditId },
      data: { 
        isMonitored,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedSubreddit);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to update monitoring status" }), 
      { status: 500 }
    );
  }
}); 