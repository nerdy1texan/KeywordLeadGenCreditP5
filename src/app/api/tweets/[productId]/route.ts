// src/app/api/tweets/[productId]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Tweet } from '@prisma/client';

export async function GET(
  req: Request,
  { params }: { params: { tweetId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tweet = await prisma.tweet.findUnique({
      where: { id: params.tweetId },
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

    if (!tweet) {
      return new NextResponse('Tweet not found', { status: 404 });
    }

    return NextResponse.json(tweet);
  } catch (error) {
    console.error('Tweet fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 