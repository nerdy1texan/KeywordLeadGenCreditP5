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

    const post = await prisma.redditPost.findUnique({
      where: { id: postId },
      include: {
        product: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const productUrl = post.product.url || '#';
    
    // Generate initial reply using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.85, // Increased for more human-like responses
      messages: [
        {
          role: "system",
          content: `You are a helpful Reddit user who happens to be familiar with ${post.product.name}. Your goal is to provide genuine help first, then naturally mention the product only if relevant.

Key Requirements:
- Write like a real Reddit user (use casual language, occasional typos ok)
- Share personal experience or insights first
- If mentioning the product, do it naturally as "I found this helpful blog/site/resource" or "I read about this on"
- Never sound salesy or promotional
- Include the URL casually like "you can check it out here (${productUrl})" only if it fits naturally
- Add filler words like "tbh", "imo", "..." to sound more human
- Use short paragraphs and casual formatting
- End with a genuine question about their situation

Product Context to Weave In Naturally:
Name: ${post.product.name}
What it is: ${post.product.description}
Key Topics: ${post.product.keywords.join(', ')}

Remember: The goal is to be genuinely helpful first. Only mention the product if it truly adds value to the conversation.`
        },
        {
          role: "user",
          content: `Write a helpful Reddit reply to this post in r/${post.subreddit}:

Title: ${post.title}
Content: ${post.text}

Requirements:
1. Address their specific situation first
2. Share relevant personal insights
3. Only mention ${post.product.name} if it naturally fits
4. Sound like a real Reddit user, not a marketer
5. End with a genuine question about their situation`
        }
      ]
    });

    const generatedReply = completion.choices[0].message.content;

    // Update the post with the generated reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: {
        latestReply: generatedReply,
        isReplied: false
      },
      include: {
        product: true
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
      include: {
        product: true // Include product info in response
      }
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