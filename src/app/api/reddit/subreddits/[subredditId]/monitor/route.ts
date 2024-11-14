// src/app/api/reddit/subreddits/[subredditId]/monitor/route.ts

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { subredditId: string } }
) {
  try {
    console.log('Received params:', params); // Debug log

    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { subredditId } = params;
    const { isMonitored } = await req.json();

    console.log('Processing request:', { subredditId, isMonitored }); // Debug log

    // First verify the subreddit exists
    const subreddit = await prisma.subredditSuggestion.findUnique({
      where: {
        id: subredditId,
      },
      include: {
        product: true
      }
    });

    if (!subreddit) {
      return new NextResponse(
        JSON.stringify({ error: "Subreddit not found" }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify user has permission to update this subreddit
    if (subreddit.product.userId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized to modify this subreddit" }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the subreddit
    const updatedSubreddit = await prisma.subredditSuggestion.update({
      where: {
        id: subredditId,
      },
      data: {
        isMonitored,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedSubreddit);
  } catch (error: any) {
    console.error("API Error Details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update monitoring status",
        details: error.message,
        code: error.code 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}