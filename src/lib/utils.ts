// src/lib/utils.ts

import { type Subscription } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DEFAULT_SKU, type SKU, ALL_SKUS_BY_ID, ROUTES } from "@/config/site";
import { ENV } from "@/env.mjs";
import { type Offering as Offering, type SubscriptionItem } from "@/typings";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ogUrl(title: string) {
  return absoluteUrl(`/api/og?title=${title}`);
}

export function absoluteUrl(path: string) {
  return `${ENV.NEXT_PUBLIC_APP_URL}${path}`;
}

export function absolutePostURL(slug: string) {
  return `${ENV.NEXT_PUBLIC_APP_URL}${ROUTES.posts.path}/${slug}`;
}

export function getOffering(subscriptionItem: SubscriptionItem): Offering {
  const skuConfig = getSKUConfigByProductId(subscriptionItem.productId);
  const targetPrice = skuConfig?.prices!.find((price) => {
    return price.id == subscriptionItem.priceId;
  });

  if (!skuConfig) {
    throw new Error(`${subscriptionItem.productId} is not defined in catalog.`);
  }
  return {
    productName: skuConfig?.name,
    productType: skuConfig.type,
    interval: targetPrice?.recurring
      ? targetPrice.recurring.interval
      : undefined,
    currency: targetPrice ? targetPrice.currency : "",
    unitAmount: targetPrice ? targetPrice.unit_amount : 0,
    priceId: targetPrice?.id,
    skuId: skuConfig.id,
  };
}

export function listAvailableOfferings({
  currency,
  interval,
}: {
  currency: string;
  interval?: string;
}): Offering[] {
  const offerings: Offering[] = [];
  ALL_SKUS_BY_ID.forEach((skuConfig) => {
    const prices = skuConfig?.prices;
    if (prices) {
      const targetPrice = prices.find(
        (price) =>
          price.currency == currency &&
          ((!interval && !price.recurring) ||
            (price && price.recurring!.interval == interval))
      );

      offerings.push({
        productName: skuConfig?.name,
        productType: skuConfig.type,
        interval: interval,
        currency: currency,
        unitAmount: targetPrice ? targetPrice.unit_amount : 0,
        priceId: targetPrice?.id,
        skuId: skuConfig.id,
        discountedUnitAmount: targetPrice?.discounted_unit_amount,
      });
    } else {
      offerings.push(buildOfferingFromDefaultPlan());
    }
  });

  return offerings;
}

export function buildOfferingFromDefaultPlan(): Offering {
  return {
    productName: DEFAULT_SKU.name,
    productType: DEFAULT_SKU.type,
    interval: undefined,
    currency: "",
    unitAmount: 0,
    skuId: DEFAULT_SKU.id,
    priceId: undefined,
  };
}

function getSKUConfigByProductId(productId: string): SKU {
  const key = Array.from(ALL_SKUS_BY_ID.keys()).find(
    (key) =>
      ALL_SKUS_BY_ID.get(key)?.product &&
      ALL_SKUS_BY_ID.get(key)?.product?.id == productId
  );
  return ALL_SKUS_BY_ID.get(key!)!;
}

export function parseSubscriptionItems(items?: string): SubscriptionItem[] {
  return (items ? JSON.parse(items) : []) as SubscriptionItem[];
}

export function getCurrentPlanOffering(subscription?: Subscription): Offering {
  if (subscription) {
    const items = parseSubscriptionItems(subscription.items);
    for (let i = 0; i < items.length; i++) {
      const offering = getOffering(items[i]!);
      if (offering.productType == "PLAN") {
        return offering;
      }
    }
  }

  return buildOfferingFromDefaultPlan();
}
