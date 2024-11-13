import { ENV } from "@/env.mjs";
import { type ReactNode } from "react";

export const SITE = {
  name: "LeadNimbus",
  title: "LeadNimbus - AI-Driven Lead Generation and Social Media Scraper",
  description:
    "LeadNimbus is a powerful AI-driven platform for lead generation, social media scraping, keyword research, and hashtag generation. Automate lead capture, track trends, and export data seamlessly.",
  url: ENV.NEXT_PUBLIC_APP_URL,
  address: "",
  email: "hello@leadnimbus.com",
  sender: "LeadNimbus <hello@leadnimbus.com>",
  creator: "LeadNimbus Team",
  githubLink: "https://github.com/nerdy1texan",
  xLink: "https://twitter.com/LeadNimbus",
  discordLink: "https://discord.gg/LeadNimbus",
  keywords: [
    "AI lead generation",
    "social media scraper",
    "Facebook data scraping",
    "Twitter (X) email scraping",
    "AI keyword research",
    "hashtag generator",
    "automated lead generation",
    "lead generation software",
    "real-time data scraping",
    "lead tracking tool",
    "AI-powered lead generation",
    "email scraper",
    "Instagram scraper",
    "Reddit scraper",
    "AI social media scraper",
    "CSV lead export",
    "social media analytics",
    "AI reply generator",
    "lead generation platform",
  ],
};


export const ROUTES = {
  home: {
    title: "LeadNimbus",
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
      description: "Affordable plan for getting started with AI-driven lead generation",
    },
    features: [
      "AI Lead Identification",
      "Lead Scoring",
      "Data Export",
      "API Access",
      "Real-Time Notifications",
      "User and Role Management",
      "Customizable Lead Filters",
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
      description: "Advanced plan with AI-driven personalization and priority support",
    },
    features: [
      "Everything in Launch Plan",
      "AI-Driven Personalized Replies",
      "Priority Support",
      "More Features Coming...",
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
