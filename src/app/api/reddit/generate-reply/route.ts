// /api/reddit/generate-reply/route.ts

import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { type NextRequest, NextResponse } from "next/server";
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = withMiddleware(async (req: NextRequest) => {
  try {
    const session = await getSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { post, engagementType } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert in engaging with Reddit posts in a ${engagementType} style. Generate a reply that is authentic, helpful, and appropriate for the subreddit's community.`
        },
        {
          role: "user",
          content: `Generate a reply to this Reddit post:\nTitle: ${post.title}\nContent: ${post.text}\nSubreddit: ${post.subreddit}\nEngagement Style: ${engagementType}`
        }
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Failed to generate reply" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}); 