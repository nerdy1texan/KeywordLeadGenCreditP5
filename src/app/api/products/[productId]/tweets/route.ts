import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tweets = await prisma.tweet.findMany({
      where: {
        productId: params.productId,
      },
      orderBy: [
        { lead: 'desc' },
        { createdAt: 'desc' },
      ],
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

    return NextResponse.json(tweets);
  } catch (error) {
    console.error('Tweet fetch error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
