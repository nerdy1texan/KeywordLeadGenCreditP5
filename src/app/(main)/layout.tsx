import "@/styles/global.css";
import localFont from "next/font/local";
import { SITE } from "@/config/site";
import { cn, ogUrl } from "@/lib/utils";
import Toaster from "@/components/Toaster";
import Analytics from "@/components/Analytics";
import { ThemeProvider } from "@/components/ThemeProvider";
import { type LayoutProps } from "@/typings";
import { AOSInit } from "@/components/AOS";
import type { Viewport, Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DictionaryProvider from "@/components/DictionaryProvider";
import { getDictionary } from "@/dictionaries";
const fontSans = localFont({
  variable: "--font-sans",
  src: "../../assets/fonts/Inter-Regular.ttf",
});

const fontHeading = localFont({
  src: "../../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

// Read more for SEO - https://dminhvu.com/nextjs-seo
// Generates your favicon set here - https://realfavicongenerator.net/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  keywords: SITE.keywords,
  authors: [
    {
      name: SITE.creator,
      url: SITE.name,
    },
  ],
  creator: SITE.creator,
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    images: [
      {
        url: ogUrl(SITE.title),
        width: 700,
        height: 577,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: ogUrl(SITE.title),
        width: 700,
        height: 577,
        alt: SITE.name,
      },
    ],
    creator: SITE.creator,
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  alternates: {
    canonical: SITE.url,
  },
  applicationName: SITE.name,
  appleWebApp: {
    title: SITE.title,
    statusBarStyle: "default",
    capable: true,
  },
  // verification: {
  //   google: "YOUR_DATA",
  //   yandex: ["YOUR_DATA"],
  //   other: {
  //     "msvalidate.01": ["YOUR_DATA"],
  //     "ir-site-verification-token": ["YOUR_DATA"],
  //     "facebook-domain-verification": ["YOUR_DATA"],
  //     "impact-site-verification": ["YOUR_DATA"],
  //     "p:domain_verify": ["YOUR_DATA"],
  //   },
  // },
  manifest: `${SITE.url}/site.webmanifest`,
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-256x256.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        rel: "apple-touch-icon",
      },
      {
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
        rel: "mask-icon",
      },
    ],
    shortcut: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#da532c",
  },
};

export default async function Layout({ children }: LayoutProps) {
  const dictionary = await getDictionary();
  return (
    <html lang={"en"} suppressHydrationWarning>
      <head>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <GoogleAnalytics />
      </head>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <DictionaryProvider dictionary={dictionary}>
          <AOSInit />
          <ThemeProvider defaultTheme="system" enableSystem>
            <SessionProvider>
              {children}
              <Analytics />
              <Toaster />
            </SessionProvider>
          </ThemeProvider>
        </DictionaryProvider>
      </body>
    </html>
  );
}
