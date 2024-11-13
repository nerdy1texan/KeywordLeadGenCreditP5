/// <reference types="stripe-event-types" />

import { type Subscription, type User, type UserGroup } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import stripe from "@/lib/stripe";
import { type PaymentMethod, type SubscriptionItem } from "@/typings";
import { getGroup } from "@/lib/user";

export async function getCurrentSubscriptionByUserGroup(userGroup: UserGroup) {
  const group = await prisma.group.findFirst({
    where: {
      id: userGroup.groupId,
    },
    include: {
      subscription: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (group == null) {
    return null;
  }

  return group.subscription;
}

export async function getCurrentPaymentMethod(subscription: Subscription) {
  const customerId = subscription.externalCustomerId;
  if (!customerId) {
    return undefined;
  }
  const customer = await stripe.customers.retrieve(customerId);
  const defaultPaymentMethod = (customer as any).invoice_settings
    .default_payment_method;
  const paymentMethod: PaymentMethod = {
    type: "card",
  };
  if (defaultPaymentMethod) {
    const stripePaymentMethod = await stripe.customers.retrievePaymentMethod(
      customerId,
      defaultPaymentMethod
    );

    paymentMethod.type = stripePaymentMethod.type;
    const card = stripePaymentMethod.card;

    if (card) {
      paymentMethod.card = {
        brand: card.brand,
        last4: card.last4,
        expMonth: card.exp_month,
        expYear: card.exp_year,
      };
    }

    const paypal = stripePaymentMethod.paypal;
    if (paypal) {
      paymentMethod.paypal = {
        payerId: paypal.payer_id,
      };
    }
  }

  return paymentMethod;
}

export async function createOrUpdateSubscription(
  stripeSubscription: Stripe.Subscription,
  groupId?: string
) {
  const items: SubscriptionItem[] = [];
  for (const item of stripeSubscription.items.data) {
    items.push({
      priceId: item.price.id,
      productId: item.price.product as string,
      quantity: item.quantity!,
    });
  }

  await prisma.subscription.upsert({
    where: {
      externalSubscriptionId: stripeSubscription.id,
    },
    create: {
      externalCustomerId: stripeSubscription.customer as string,
      status: stripeSubscription.status,
      items: JSON.stringify(items),
      externalSubscriptionId: stripeSubscription.id,
      externalCurrentPeriodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      subscriberGroup: {
        connect: {
          id: groupId,
        },
      },
    },
    update: {
      status: stripeSubscription.status,
      items: JSON.stringify(items),
      externalCurrentPeriodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
    },
  });
}

export async function getCurrentSubscriptionByUser(user: User) {
  const userGroup = await getGroup(user);

  if (!userGroup) {
    throw new Error("UserGroup can't be null");
  }
  return await getCurrentSubscriptionByUserGroup(userGroup);
}

export async function getSubscriptionAndPaymentMethod(user: User) {
  const subscription = await getCurrentSubscriptionByUser(user);

  if (!subscription) {
    return {};
  }

  const paymentMethod = await getCurrentPaymentMethod(subscription);
  return {
    paymentMethod,
    subscription,
  };
}
