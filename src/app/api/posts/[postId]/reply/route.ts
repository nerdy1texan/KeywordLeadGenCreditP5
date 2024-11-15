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

    // Fetch the post with product information
    const post = await prisma.redditPost.findUnique({
      where: { id: postId },
      include: {
        product: {
          select: {
            name: true,
            description: true,
            keywords: true
          }
        }
      }
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
          content: `You are an expert at engaging with Reddit users and subtle product promotion. Your goal is to:
          1. Provide genuine value and show understanding of the user's post
          2. Build trust through authenticity and expertise
          3. Naturally transition to a relevant product recommendation
          4. Never be overly promotional or sales-focused
          
          Product Context:
          - Name: ${post.product.name}
          - Description: ${post.product.description}
          - Keywords: ${post.product.keywords.join(', ')}`
        },
        {
          role: "user",
          content: `Generate a helpful Reddit reply for this post that naturally promotes our product:
          Subreddit: ${post.subreddit}
          Title: ${post.title}
          Content: ${post.text}
          
          Reply Format:
          1. Start with empathy/understanding
          2. Provide immediate value/advice
          3. Share relevant experience
          4. Naturally mention our product as a solution (${post.product.name}) without being too promotional
          5. End with an engaging question that encourages further discussion`
        }
      ]
    });

    const generatedReply = completion.choices[0].message.content;

    // Update the post with the generated reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: {
        latestReply: generatedReply
      },
      include: {
        product: {
          select: {
            name: true,
            description: true,
            keywords: true
          }
        }
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