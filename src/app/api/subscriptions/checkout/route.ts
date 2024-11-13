import { getCurrentSubscriptionByUserGroup } from "@/lib/subscriptions";
import { validateParseResult, withMiddleware } from "@/lib/apiHelper";
import { getSession } from "@/lib/session";
import { getGroup } from "@/lib/user";
import stripe from "@/lib/stripe";
import { DEFAULT_PRICE_TYPE, ROUTES } from "@/config/site";
import { ENV } from "@/env.mjs";
import { InvalidRequestError } from "@/lib/exceptions";
import { checkoutSchema } from "@/lib/validation";
import { type NextRequest, NextResponse } from "next/server";

const handler = async (req: NextRequest) => {
  const result = checkoutSchema.safeParse(await req.json());
  validateParseResult(result);

  if (result.success) {
    const data = result.data;
    const stripePriceId = data.stripePriceId;
    const quantity = data.quantity;
    const ref = data.ref;

    let groupId = null;
    const session = await getSession();
    if (session != null && session.user) {
      // At this point, user is signed in.
      const userGroup = await getGroup(session.user);
      if (userGroup) {
        groupId = userGroup.groupId;
        const currentSubscription = await getCurrentSubscriptionByUserGroup(
          userGroup
        );

        if (currentSubscription) {
          if (
            currentSubscription.externalCurrentPeriodEnd != null &&
            currentSubscription.externalCurrentPeriodEnd > new Date()
          ) {
            // User has an active subscription and want to change.
            const portalSession = await stripe.billingPortal.sessions.create({
              customer: currentSubscription.externalCustomerId,
              return_url: ENV.NEXT_PUBLIC_APP_URL + ref,
            });
            return new NextResponse(JSON.stringify({ url: portalSession.url }));
          } else {
            throw new InvalidRequestError(
              "Changing plan is not available for one time product"
            );
          }
        }
      }
    }

    if (!stripePriceId || !quantity) {
      throw new InvalidRequestError("stripePriceId or quantity can't be empty");
    }

    const isOneTime = DEFAULT_PRICE_TYPE == "one_time";
    const { url } = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      line_items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      success_url: ENV.NEXT_PUBLIC_APP_URL + ROUTES.checkoutSuccess.path,
      cancel_url: ENV.NEXT_PUBLIC_APP_URL + ref,
      metadata: {
        groupId: groupId,
      },
      customer_creation: isOneTime ? "always" : undefined,
      allow_promotion_codes: true,
    });

    return new NextResponse(JSON.stringify({ url }));
  }
};

export const POST = withMiddleware(handler);
