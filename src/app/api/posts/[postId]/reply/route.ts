import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const post = await prisma.redditPost.findUnique({
      where: { id: params.postId },
      include: { product: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const productUrl = post.product.url || '#';
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.85,
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

    // Safely handle the OpenAI response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Failed to get content from OpenAI response");
    }

    // Update the post with the new reply
    const updatedPost = await prisma.redditPost.update({
      where: { id: params.postId },
      data: { 
        latestReply: content,
        isReplied: false
      },
      include: { product: true },
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

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const body = await req.json();
    const { latestReply, isReplied } = body;

    const updateData: any = {};
    if (latestReply !== undefined) updateData.latestReply = latestReply;
    if (isReplied !== undefined) updateData.isReplied = isReplied;

    const updatedPost = await prisma.redditPost.update({
      where: { id: params.postId },
      data: updateData,
      include: { product: true }, // Make sure to include the product
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}