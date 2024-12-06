import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { type = 'reddit' } = await req.json(); // Add type parameter
    const { postId } = params;

    // Handle both Reddit posts and tweets
    if (type === 'reddit') {
      const post = await prisma.redditPost.update({
        where: { id: postId },
        data: {
          isReplied: true,
          latestReply: reply,
        },
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
      });
      return NextResponse.json(post);
    } else {
      const tweet = await prisma.tweet.update({
        where: { id: postId },
        data: {
          isReplied: true,
          latestReply: reply,
        },
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
      });
      return NextResponse.json(tweet);
    }

  } catch (error) {
    console.error('Reply error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
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