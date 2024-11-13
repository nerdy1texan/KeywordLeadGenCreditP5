import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const monitoredSubreddits = await prisma.subredditSuggestion.findMany({
      where: {
        product: {
          userId: session.user.id
        },
        isMonitored: true
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(monitoredSubreddits);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch monitored subreddits" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, url, productId } = body;

    // Validate that the product belongs to the user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id,
      },
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ error: "Product not found or unauthorized" }), 
        { status: 404 }
      );
    }

    // Check if already monitoring this subreddit for this product
    const existing = await prisma.monitoredSubreddit.findFirst({
      where: {
        name,
        productId,
      },
    });

    if (existing) {
      return new NextResponse(
        JSON.stringify({ error: "Already monitoring this subreddit" }), 
        { status: 400 }
      );
    }

    // Create new monitored subreddit
    const monitoredSubreddit = await prisma.monitoredSubreddit.create({
      data: {
        name,
        url,
        productId,
      },
    });

    return NextResponse.json(monitoredSubreddit);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to monitor subreddit" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
