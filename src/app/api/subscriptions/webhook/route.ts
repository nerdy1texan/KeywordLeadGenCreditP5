/// <reference types="stripe-event-types" />

import { headers } from "next/headers";
import type Stripe from "stripe";

import { ENV } from "@/env.mjs";
import stripe from "@/lib/stripe";
import { createOrUpdateSubscription } from "@/lib/subscriptions";
import { createGroup, createUserWithGroup, getUserByEmail } from "@/lib/user";
import { sendMagicLink } from "@/lib/email";
import { type NextRequest, NextResponse } from "next/server";

async function createOrUpdateInternalSubscription(
  subscriptionId: string,
  groupId: string | undefined,
  oneTimeSubscriptionRetriever: () => Promise<Stripe.Subscription | null>
) {
  let subscription;
  if (subscriptionId == null) {
    // Handles one_time product
    subscription = await oneTimeSubscriptionRetriever();
  } else {
    // Handles recurring product
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  }

  if (subscription) {
    await createOrUpdateSubscription(subscription, groupId).catch((e) => {
      console.log(e);
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.DiscriminatedEvent;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      ENV.STRIPE_WEBHOOK_SIGNING_KEY
    ) as Stripe.DiscriminatedEvent;
  } catch (error: any) {
    console.log("Error found while constructing event", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      let email = session.customer_email;
      let name = email;
      if (!email && session.customer_details) {
        email = session.customer_details.email;
        name = session.customer_details.name;
      }
      if (!email) {
        return new NextResponse(`customer_email is required in the event`, {
          status: 400,
        });
      }

      let groupId = session.metadata ? session.metadata.groupId : null;

      let isUserSignedIn = false;

      if (!groupId) {
        isUserSignedIn = true;
        // User checked out without signed in.
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
              name: name ?? "",
              email: email,
              password: Math.random().toString(36).slice(-12),
            })
          ).group.id;
        }
      }

      await createOrUpdateInternalSubscription(
        session.subscription as string,
        groupId,
        async () => {
          const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            {
              expand: ["line_items"],
            }
          );
          const lineItems = sessionWithLineItems.line_items;
          if (lineItems && session.customer) {
            return {
              items: lineItems,
              customer: session.customer,
              id: `sub_onetime_${groupId}`, /// Fake subscription id for one_time product
              current_period_end: null,
              status: "active",
            } as unknown as Stripe.Subscription;
          }

          return null;
        }
      );

      if (!isUserSignedIn) await sendMagicLink({ email: email });
      break;
    case "invoice.payment_succeeded":
      const invoice = event.data.object;
      await createOrUpdateInternalSubscription(
        invoice.subscription as string,
        invoice.metadata ? invoice.metadata.group_id : undefined,
        async () => {
          const lineItems = await stripe.invoices.listLineItems(invoice.id);
          if (lineItems && session.customer) {
            return {
              items: lineItems,
              customer: invoice.customer,
              id: invoice.customer, /// Fake subscription id for one_time product
              current_period_end: null,
            } as unknown as Stripe.Subscription;
          }

          return null;
        }
      );
    // As your bussiness grows, you might also want to listen to below events.
    // case "customer.subscription.created":
    //   // Then define and call a method to handle the subscription created.
    //   break;
    // case "customer.subscription.trial_will_end":
    //   // Then define and call a method to handle the subscription trial ending.
    //   break;

    // case "customer.subscription.deleted":
    //   // Then define and call a method to handle the subscription deleted.
    //   break;

    // case "customer.subscription.updated":
    //   // Then define and call a method to handle the subscription update.
    //   break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  return new NextResponse(null, { status: 200 });
}
