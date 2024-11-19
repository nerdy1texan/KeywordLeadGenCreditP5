import { ENV } from "@/env.mjs";
import { type ReactNode } from "react";

export const SITE = {
  name: "KeywordLeadGen",
  title: "KeywordLeadGen - AI-Powered Reddit Lead Generation Platform",
  description:
    "KeywordLeadGen is an intelligent AI platform that helps businesses discover and convert high-intent leads from Reddit. Automate subreddit discovery, track discussions, and engage with potential customers authentically.",
  url: ENV.NEXT_PUBLIC_APP_URL,
  address: "",
  email: "hello@keywordleadgen.com",
  sender: "KeywordLeadGen <hello@keywordleadgen.com>",
  creator: "KeywordLeadGen Team",
  githubLink: "https://github.com/nerdy1texan",
  xLink: "https://twitter.com/KeywordLeadGen",
  discordLink: "https://discord.gg/KeywordLeadGen",
  keywords: [
    "Reddit lead generation",
    "AI lead discovery",
    "subreddit analysis",
    "Reddit marketing tool",
    "AI engagement assistant",
    "Reddit lead finder",
    "automated lead generation",
    "Reddit sales prospecting",
    "real-time discussion monitoring",
    "lead tracking tool",
    "AI-powered lead generation",
    "Reddit intent detection",
    "subreddit intelligence",
    "Reddit business leads",
    "AI Reddit analyzer",
    "lead export",
    "Reddit analytics",
    "AI reply generator",
    "Reddit engagement platform",
    "B2B Reddit leads"
  ],
};


export const ROUTES = {
  home: {
    title: "KeywordLeadGen",
    path: "/",
  },
  features: {
    title: "Features",
    path: "/#features",
  },
  pricing: {
    title: "Pricing",
    path: "/#pricing",
  },
  faq: {
    title: "Faqs",
    path: "/#faqs",
  },
  dashboard: {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    excludeFromSEO: true,
    isAdmin: false,
  },
  terms: {
    title: "Terms",
    path: "/terms",
  },
  tutorials: {
    title: "Tutorials",
    path: "/tutorials",
  },
  privaryPolicy: {
    title: "Privacy Policy",
    path: "/privacy-policy",
  },
  signin: {
    title: "Sign in",
    path: "/signin",
  },
  signup: {
    title: "Sign up",
    path: "/signup",
  },
  forgotPassword: {
    title: "Forgot password",
    path: "/forgot-password",
  },
  waitlist: {
    title: "Waitlist",
    path: "/waitlist",
  },
  maintenance: {
    title: "Maintenance",
    path: "/maintenance",
    excludeFromSEO: true,
  },
  settings: {
    title: "Settings",
    path: "/dashboard/settings",
    icon: "Settings",
    excludeFromSEO: true,
    isAdmin: false,
  },
  subscription: {
    title: "Subscription",
    path: "/dashboard/subscription",
    icon: "Rss",
    excludeFromSEO: true,
    isAdmin: false,
  },
  checkoutSuccess: {
    title: "Checkout Success",
    path: "/checkout-success",
    excludeFromSEO: true,
  },
  posts: {
    title: "Blog",
    path: "/posts",
  },
  pages: {
    title: "Pages",
    path: "/pages",
    excludeFromSEO: true,
  },
  admin: {
    title: "Admin",
    path: "/dashboard/admin",
    icon: "KeySquare",
    excludeFromSEO: true,
    isAdmin: true,
  },
  redeem: {
    title: "Redeem Code",
    path: "/redeem",
  },
  apiSubscriptionsCheckout: {
    path: "/api/subscriptions/checkout",
    excludeFromSEO: true,
  },
  apiSubscriptionsManage: {
    path: "/api/subscriptions/manage",
    excludeFromSEO: true,
  },
  apiSignup: {
    path: "/api/signup",
    excludeFromSEO: true,
  },
  apiPasswordRequestReset: {
    path: "/api/password/request-reset",
    excludeFromSEO: true,
  },
  apiPasswordReset: {
    path: "/api/password/reset",
    excludeFromSEO: true,
  },
  apiNewsletter: {
    path: "/api/newsletter",
    excludeFromSEO: true,
  },
  apiUpdateUser: {
    path: "/api/users",
    excludeFromSEO: true,
  },
  apiAdmin: {
    path: "/api/admin",
    excludeFromSEO: true,
  },
  apiRedeem: {
    path: "/api/redeem",
    excludeFromSEO: true,
  },
  aboutUs: {
    title: "About Us",
    path: "/about-us",
  },
  products: {
    title: "Products",
    path: "/dashboard/products",
    icon: "Package",
    excludeFromSEO: true,
    isAdmin: false,
  },
};

export const MENUS = {
  mainNavigation: [
    ROUTES.features,
    ROUTES.pricing,
    ROUTES.faq,
    // ROUTES.docs,
    ROUTES.posts,
    ROUTES.aboutUs,
  ],
  dashboardNavigation: [
    ROUTES.dashboard,
    ROUTES.products,
    ROUTES.subscription,
    ROUTES.settings,
    ROUTES.admin,
  ],
  footNavigation: [
    // ROUTES.redeem,
    ROUTES.features,
    ROUTES.pricing,
    ROUTES.faq,
    ROUTES.aboutUs,
    ROUTES.tutorials,
  ],
  waitlistNavigation: [ROUTES.features, ROUTES.faq, ROUTES.tutorials],
  additionalPages: [
    ROUTES.waitlist,
    ROUTES.redeem,
    ROUTES.checkoutSuccess,
    ROUTES.terms,
    ROUTES.privaryPolicy,
    ROUTES.maintenance,
  ],
};

export type PriceType = "one_time" | "recurring";
export type PriceInterval = "month" | "year";
export interface PriceConfig {
  id?: string;
  discounted_unit_amount?: number;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: PriceInterval;
  };
  type: PriceType;
}

export interface SKU {
  id: string;
  for: string;
  name: string;
  features: (string | ReactNode)[];
  type: "PLAN";
  product: {
    id?: string;
    description: string;
  };
  prices?: PriceConfig[];
}

export const CURRENCY_TO_SYMBOL: { [key: string]: string } = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  CRC: "₡", // Costa Rican Colón
  GBP: "£", // British Pound Sterling
  ILS: "₪", // Israeli New Sheqel
  INR: "₹", // Indian Rupee
  JPY: "¥", // Japanese Yen
  KRW: "₩", // South Korean Won
  NGN: "₦", // Nigerian Naira
  PHP: "₱", // Philippine Peso
  PLN: "zł", // Polish Zloty
  PYG: "₲", // Paraguayan Guarani
  THB: "฿", // Thai Baht
  UAH: "₴", // Ukrainian Hryvnia
  VND: "₫", // Vietnamese Dong
};

export type SKUId = string;

const allSKUs: SKU[] = [
  {
    id: "Launch",
    name: "Launch plan",
    for: "Startups and small businesses",
    type: "PLAN",
    product: {
      description: "Perfect for businesses starting their Reddit lead generation journey",
    },
    features: [
      "AI Subreddit Discovery",
      "Intent Detection",
      "Lead Scoring",
      "Basic Analytics",
      "Real-Time Notifications",
      "5 Tracked Subreddits",
      "CSV Export"
    ],
    prices: [
      {
        discounted_unit_amount: 7900,
        unit_amount: 17900,
        currency: "usd",
        type: "one_time",
      },
    ],
  },
  {
    id: "Boost",
    name: "Boost plan",
    for: "Growing businesses and agencies",
    type: "PLAN",
    product: {
      description: "Advanced Reddit lead generation with AI-powered engagement tools",
    },
    features: [
      "Everything in Launch Plan",
      "AI Reply Assistant",
      "Unlimited Subreddits",
      "Competitor Tracking",
      "Priority Support",
      "Advanced Analytics",
      "Custom Alerts"
    ],
    prices: [
      {
        discounted_unit_amount: 9900,
        unit_amount: 19900,
        currency: "usd",
        type: "one_time",
      },
    ],
  },
];



export const ALL_SKUS_BY_ID: Map<SKUId, SKU> = new Map(
  allSKUs.map((sku) => [sku.id, sku])
);

export const DEFAULT_PRICE_TYPE: PriceType = "one_time";
export const DEFAULT_SKU: SKU = {
  name: "Free Plan",
  type: "PLAN",
  id: "Free Plan",
  for: "",
  features: [],
  product: {
    description: "Free Plan",
  },
};
export const DEFAULT_CURRENCY = "usd";
