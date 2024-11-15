import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { comment } = await req.json();

    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: {
        latestReply: comment,
        isReplied: true
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error saving comment:', error);
    return NextResponse.json(
      { error: 'Failed to save comment' },
      { status: 500 }
    );
  }
}