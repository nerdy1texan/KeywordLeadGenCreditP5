import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    // Fetch the post
    const post = await prisma.redditPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Generate initial reply using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant generating a Reddit comment reply. Be concise, helpful, and authentic."
        },
        {
          role: "user",
          content: `Please generate a helpful reply for this Reddit post:
            Subreddit: ${post.subreddit}
            Title: ${post.title}
            Content: ${post.text}`
        }
      ]
    });

    const generatedReply = completion.choices[0].message.content;

    // Update the post with the generated reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: {
        latestReply: generatedReply
      }
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error generating reply:', error);
    return NextResponse.json(
      { error: 'Failed to generate reply' },
      { status: 500 }
    );
  }
}

// Update reply status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { isReplied } = await req.json();

    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: { isReplied },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating reply status:", error);
    return NextResponse.json(
      { error: "Failed to update reply status" },
      { status: 500 }
    );
  }
}