import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define a type that includes common properties between Tweet and RedditPost
type Post = {
  id: string;
  text: string;
  url: string;
  author: string;
  createdAt: Date;
  productId: string;
  engagement: string;
  isReplied: boolean;
  latestReply: string | null;
  product: {
    name: string;
    description: string;
    keywords: string[];
    url: string | null;
  };
};

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    // Debug incoming request
    console.log('Incoming request params:', params);
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Parse JSON body safely
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { postId } = params;
    let post: Post | null = null;
    let type = 'reddit';

    // First try to find Reddit post
    post = await prisma.redditPost.findUnique({
      where: { id: postId },
      include: {
        product: {
          select: {
            name: true,
            description: true,
            keywords: true,
            url: true,
          },
        },
      },
    }) as Post | null;

    // If not found, try to find Tweet
    if (!post) {
      post = await prisma.tweet.findUnique({
        where: { id: postId },
        include: {
          product: {
            select: {
              name: true,
              description: true,
              keywords: true,
              url: true,
            },
          },
        },
      }) as Post | null;
      type = 'twitter';
    }

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    console.log('Found post:', post);
    console.log('Post type:', type);

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Enhanced system prompt for product-focused replies
    const systemPrompt = `You are a helpful marketing assistant for ${post.product.name}. 
    Your goal is to generate authentic, helpful responses that naturally promote the product.
    
    Product Details:
    - Name: ${post.product.name}
    - Description: ${post.product.description}
    - Key Features: ${post.product.keywords.join(', ')}
    - Website: ${post.product.url}
    
    Guidelines:
    1. Be authentic and conversational
    2. Address the user's specific points/questions
    3. Naturally weave in product benefits
    4. Always include the product URL near the end
    5. Don't be overly salesy or pushy
    6. Keep responses helpful and relevant
    7. Use a friendly, professional tone
    
    Format your response to:
    1. Show understanding/empathy
    2. Provide value/advice
    3. Connect to product solution
    4. End with a call-to-action and URL`;

    // Generate reply using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate a natural, helpful reply to this ${type} post that subtly promotes our product: "${post.text}"`
        }
      ],
      temperature: 0.7, // Slightly increased for more natural responses
      max_tokens: 250, // Increased for more detailed responses
    });

    let reply = completion.choices[0]?.message?.content || '';

    // Ensure URL is included if not already present
    if (!reply.includes(post.product.url || '')) {
      reply = `${reply}\n\nLearn more at: ${post.product.url}`;
    }

    console.log('Generated reply:', reply);

    // Update the post with the generated reply
    if (type === 'reddit') {
      await prisma.redditPost.update({
        where: { id: postId },
        data: {
          isReplied: true,
          latestReply: reply,
        },
      });
    } else {
      await prisma.tweet.update({
        where: { id: postId },
        data: {
          isReplied: true,
          latestReply: reply,
        },
      });
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Database or OpenAI error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const { latestReply, isReplied, type = 'reddit' } = body;

    const updateData: any = {};
    if (latestReply !== undefined) updateData.latestReply = latestReply;
    if (isReplied !== undefined) updateData.isReplied = isReplied;

    if (type === 'reddit') {
      const updatedPost = await prisma.redditPost.update({
        where: { id: params.postId },
        data: updateData,
        include: { product: true },
      });
      return NextResponse.json(updatedPost);
    } else {
      const updatedTweet = await prisma.tweet.update({
        where: { id: params.postId },
        data: updateData,
        include: { product: true },
      });
      return NextResponse.json(updatedTweet);
    }
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}