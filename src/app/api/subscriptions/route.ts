import { getCurrentSubscriptionByUser } from "@/lib/subscriptions";
import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

const handler = async () => {
  const session = await getSession();
  if (session != null) {
    const subscription = await getCurrentSubscriptionByUser(session.user);
    return new NextResponse(JSON.stringify(subscription));
  }
};

export const GET = withMiddleware(handler);
