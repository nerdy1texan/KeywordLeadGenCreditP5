import {
  getCurrentPaymentMethod,
  getCurrentSubscriptionByUser,
} from "@/lib/subscriptions";
import { withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

const handler = async () => {
  const session = await getSession();
  if (session != null && session.user) {
    const subscription = await getCurrentSubscriptionByUser(session.user);
    if (subscription != null) {
      const paymentMethod = await getCurrentPaymentMethod(subscription);
      return new NextResponse(
        JSON.stringify({
          subscription,
          paymentMethod,
        })
      );
    }
  }
};

export const GET = withMiddleware(handler);
