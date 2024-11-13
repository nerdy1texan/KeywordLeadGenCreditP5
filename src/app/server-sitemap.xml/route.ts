import { ROUTES } from "@/config/site";
import { ENV } from "@/env.mjs";
import { getPublishedDocumentSlugs } from "@/lib/cms";
import { getServerSideSitemap } from "next-sitemap";
import type { ISitemapField } from "next-sitemap";

type RouteConfig = {
  [key: string]: {
    path: string;
    excludeFromSEO?: boolean;
  };
};

export async function GET() {
  const result: ISitemapField[] = [];

  Object.entries(ROUTES as RouteConfig).forEach(([_, route]) => {
    if (route.path !== "/" && !route.excludeFromSEO) {
      result.push({
        loc: `${ENV.NEXT_PUBLIC_APP_URL}${route.path}`,
        lastmod: new Date().toISOString(),
        changefreq: "weekly",
        priority: 1.0,
      });
    }
  });

  (await getPublishedDocumentSlugs("pages")).forEach((slug) => {
    result.push({
      loc: `${ENV.NEXT_PUBLIC_APP_URL}${(ROUTES as RouteConfig).pages?.path ?? ''}/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: 1.0,
    });
  });

  (await getPublishedDocumentSlugs("posts")).forEach((slug) => {
    result.push({
      loc: `${ENV.NEXT_PUBLIC_APP_URL}${(ROUTES as RouteConfig).posts?.path ?? ''}/${slug}`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: 1.0,
    });
  });

  return getServerSideSitemap(result);
}