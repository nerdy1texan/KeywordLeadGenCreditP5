import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;

    // Get post and associated product details
    const post = await prisma.redditPost.findUnique({
      where: { id: postId },
      include: {
        product: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Construct prompt for GPT-4
    const prompt = `
      Generate a helpful and authentic Reddit comment reply to this post. 
      The reply should naturally incorporate information about our product/service when relevant.

      Post Title: ${post.title}
      Post Content: ${post.text}
      Subreddit: r/${post.subreddit}

      Product Information:
      Name: ${post.product.name}
      Description: ${post.product.description}
      Key Features: ${post.product.keywords.join(", ")}

      Guidelines:
      - Be conversational and authentic
      - Address the specific points in the post
      - Only mention the product if naturally relevant
      - Show empathy and understanding
      - Keep the response concise but helpful
      - Avoid being overly promotional
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant helping to improve a Reddit comment. Context:" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const generatedReply = completion.data.choices[0]?.message?.content || "";

    // Update the post with the generated reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: postId },
      data: { latestReply: generatedReply },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error generating reply:", error);
    return NextResponse.json(
      { error: "Failed to generate reply" },
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