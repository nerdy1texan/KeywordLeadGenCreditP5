import MainFooter from "@/components/MainFooter";
import MainHeader from "@/components/MainHeader";
import Loading from "@/components/Loading";
import { type LayoutProps } from "@/typings";
import { Suspense } from "react";

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <MainHeader />
      <main className="min-h-screen">
        <Suspense
          fallback={
            <div className="h-screen">
              <Loading />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <MainFooter />
    </>
  );
}
