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

    // Fetch the post with complete product information
    const post = await prisma.redditPost.findUnique({
      where: { id: postId },
      include: {
        product: true // Get all product fields
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Default URL handling
    const productUrl = post.product.url || '#';
    const productContext = `Product Name: ${post.product.name}
Description: ${post.product.description}
Key Features: ${post.product.keywords.join(', ')}
Learn More: ${productUrl}`;

    // Generate initial reply using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7, // Add some creativity
      messages: [
        {
          role: "system",
          content: `You are an expert Reddit engagement specialist who excels at natural conversation and subtle product promotion.

Key Guidelines:
- Write in a conversational, Reddit-appropriate tone
- Show genuine understanding of the user's situation
- Share relevant personal experiences or insights
- Provide actionable advice first
- Naturally weave in product mention only where relevant
- Always include the product URL near the end
- End with an engaging question

Product Context:
${productContext}

Remember:
1. Be helpful first, promotional second
2. Match the subreddit's tone and style
3. Make the product mention feel natural and relevant
4. Include URL in a casual way like "Check it out at: ${productUrl}" or "More details: ${productUrl}"
5. Keep the response authentic and valuable`
        },
        {
          role: "user",
          content: `Generate a helpful Reddit reply for:
Subreddit: r/${post.subreddit}
Post Title: ${post.title}
Post Content: ${post.text}

Requirements:
1. Address the user's specific situation
2. Provide valuable advice
3. Include our product only if relevant
4. Add the product URL naturally
5. End with an engaging question`
        }
      ]
    });

    const generatedReply = completion.choices[0].message.content;

    // Update the post with the generated reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: {
        latestReply: generatedReply,
        isReplied: false // Set to false since it's just generated, not posted
      },
      include: {
        product: true // Return full product info
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