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

    // Generate reply using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant generating a response for ${post.product.name}. 
                   Use the following product details:
                   Description: ${post.product.description}
                   Keywords: ${post.product.keywords.join(', ')}
                   URL: ${post.product.url}`
        },
        {
          role: "user",
          content: `Generate a friendly and engaging reply to this ${type} post: "${post.text}"`
        }
      ],
      max_tokens: 150,
    });

    const reply = completion.choices[0]?.message?.content || '';
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