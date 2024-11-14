import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const monitoredSubreddits = await prisma.subredditSuggestion.findMany({
      where: {
        isMonitored: true,
        product: {
          userId: session.user.id
        }
      },
      include: {
        product: true
      }
    });

    return NextResponse.json(monitoredSubreddits);
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to fetch monitored subreddits" }), 
      { status: 500 }
    );
  }
}
