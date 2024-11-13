import { withMiddleware } from "@/lib/apiHelper";
import { prisma } from "@/lib/db";
import { sendMagicLink } from "@/lib/email";
import { CodeAlreadyRedeemed } from "@/lib/exceptions";
import { createOrUpdateSubscription } from "@/lib/subscriptions";
import { createGroup, createUserWithGroup, getUserByEmail } from "@/lib/user";
import { SubscriptionItem } from "@/typings";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const handler = async (req: NextRequest) => {
  const { code, email } = await req.json();

  const activationCode = await prisma.activationCode.findFirst({
    where: { code: code, active: true },
  });

  let groupId = null;
  if (!activationCode) {
    throw new CodeAlreadyRedeemed();
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    if (!existingUser.userGroup) {
      // User exists, but userGroup doesn't, ideally this should never happen.
      groupId = (await createGroup(existingUser)).id;
    } else {
      groupId = existingUser.userGroup.groupId;
    }
  } else {
    groupId = (
      await createUserWithGroup({
        name: email.split("@")[0],
        email: email,
        password: Math.random().toString(36).slice(-12),
      })
    ).group.id;
  }

  const items: SubscriptionItem[] = activationCode?.data
    ? JSON.parse(activationCode?.data).items
    : [];

  const stripeItems = [];
  for (const item of items) {
    stripeItems.push({
      price: {
        id: item.priceId,
        product: item.productId,
      },
      quantity: item.quantity,
    });
  }

  if (stripeItems.length == 0) {
    throw new CodeAlreadyRedeemed();
  }

  await createOrUpdateSubscription(
    {
      items: {
        data: stripeItems,
      },
      customer: "",
      id: `sub_onetime_${groupId}`, /// Fake subscription id for one_time product
      current_period_end: null,
      status: "active",
    } as unknown as Stripe.Subscription,
    groupId
  );

  await sendMagicLink({ email: email });
  await prisma.activationCode.update({
    where: {
      code: code,
    },
    data: {
      active: false,
    },
  });

  return new NextResponse();
};

export const POST = withMiddleware(handler);
