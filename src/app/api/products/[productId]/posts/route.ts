import { type NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";

export const GET = withMiddleware(async (req: NextRequest, { params }: { params: { productId: string } }) => {
  try {
    const { productId } = params;
    const { searchParams } = new URL(req.url);
    
    const engagement = searchParams.get('engagement');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const posts = await prisma.redditPost.findMany({
      where: { 
        productId,
        ...(engagement ? { engagement } : {})
      },
      orderBy: { 
        [sortBy]: sortOrder
      },
      take: limit
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}); 