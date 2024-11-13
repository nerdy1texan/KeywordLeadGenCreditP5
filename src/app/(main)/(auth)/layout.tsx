import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import type { LayoutProps } from "@/typings";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ROUTES, SITE } from "@/config/site";
export function generateMetadata(): Metadata {
  const headersList = headers();
  const pathname = headersList.get("next-url") || "/";
  const route = Object.values(ROUTES).findLast((route) =>
    pathname.includes(route.path)
  );
  return {
    title: (route && (route as any).title) ?? SITE.title,
    description: SITE.description,
  };
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <MainHeader />
      <main className="min-h-screen">{children}</main>
      <MainFooter />
    </>
  );
}
