import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { comment } = await req.json();

    // Debug logging
    console.log("Saving comment for post:", postId);
    console.log("Comment content:", comment);

    if (!postId || !comment) {
      return NextResponse.json(
        { error: "Post ID and comment are required" },
        { status: 400 }
      );
    }

    // Update the post with the new comment
    const updatedPost = await prisma.redditPost.update({
      where: {
        id: postId,
      },
      data: {
        latestReply: comment,
      },
      include: {
        product: true,
      },
    });

    console.log("Updated post:", updatedPost);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error saving comment:", error);
    return NextResponse.json(
      { error: "Failed to save comment" },
      { status: 500 }
    );
  }
}