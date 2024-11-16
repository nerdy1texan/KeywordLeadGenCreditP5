import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// Update the RouteHandler type to match withMiddleware's return type
type RouteHandler = (
  req: NextRequest,
  context: { params: { productId: string } }
) => Promise<Response | undefined>;

// Update the handler declarations to match the type
export const GET = withMiddleware(async (req: NextRequest) => {
  const productId = req.nextUrl.pathname.split('/')[3];
  try {
    // Debug logging
    console.log("Request received:", {
      productId,
      url: req.url,
      method: req.method
    });

    // Validate productId
    if (!productId || typeof productId !== 'string') {
      console.log("Invalid productId:", productId);
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // First verify the product exists
    console.log("Fetching product:", productId);
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    console.log("Product found:", product ? "yes" : "no");
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch subreddits with error handling
    console.log("Fetching subreddits for product:", productId);
    const subreddits = await prisma.subredditSuggestion.findMany({
      where: { 
        productId: productId
      },
      orderBy: { 
        relevanceScore: 'desc' 
      }
    });

    console.log("Subreddits found:", subreddits.length);

    // Format the response data with type safety
    const formattedSubreddits = subreddits.map(subreddit => ({
      id: subreddit.id,
      name: subreddit.name,
      title: subreddit.title,
      description: subreddit.description,
      memberCount: subreddit.memberCount,
      url: subreddit.url,
      relevanceScore: subreddit.relevanceScore,
      matchReason: subreddit.matchReason ?? '',
      isMonitored: subreddit.isMonitored,
      productId: subreddit.productId,
      createdAt: subreddit.createdAt,
      updatedAt: subreddit.updatedAt
    }));

    return NextResponse.json(formattedSubreddits);

  } catch (error) {
    // Enhanced error logging
    console.error("Detailed Error Information:", {
      error: error,
      errorName: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorStack: error instanceof Error ? error.stack : undefined,
      productId: productId,
      timestamp: new Date().toISOString()
    });

    // Specific error handling for Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error:", {
        code: error.code,
        message: error.message,
        meta: error.meta,
        productId: productId
      });

      return NextResponse.json(
        { 
          error: "Database error",
          code: error.code,
          details: error.message
        },
        { status: 400 }
      );
    }

    // Handle potential MongoDB ObjectId validation errors
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { 
          error: "Invalid ID format",
          details: "The provided ID is not in the correct format"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to fetch subreddits",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
});

// PATCH endpoint remains the same but with improved error handling
export const PATCH = withMiddleware(async (req: NextRequest) => {
  const productId = req.nextUrl.pathname.split('/')[3];
  try {
    const body = await req.json();
    const { subredditId, isMonitored } = body;

    // Input validation
    if (!productId || !subredditId) {
      return NextResponse.json(
        { error: "Product ID and Subreddit ID are required" },
        { status: 400 }
      );
    }

    // Verify both product and subreddit exist
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const subreddit = await prisma.subredditSuggestion.findUnique({
      where: { id: subredditId }
    });

    if (!subreddit) {
      return NextResponse.json(
        { error: "Subreddit not found" },
        { status: 404 }
      );
    }

    // Update with error handling
    const updatedSubreddit = await prisma.subredditSuggestion.update({
      where: {
        id: subredditId,
        productId: productId
      },
      data: {
        isMonitored: Boolean(isMonitored)
      }
    });

    return NextResponse.json(updatedSubreddit);

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma Error:", {
        code: error.code,
        message: error.message,
        productId: productId
      });

      return NextResponse.json(
        { 
          error: "Database error",
          code: error.code,
          details: error.message
        },
        { status: 400 }
      );
    }

    console.error("API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      productId: productId
    });

    return NextResponse.json(
      { 
        error: "Failed to update subreddit",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
});
