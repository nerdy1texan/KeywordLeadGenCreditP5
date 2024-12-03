import { redirect } from "next/navigation";
import { Suspense } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { getSession, isAdmin } from "@/lib/session";
import { getCurrentSubscriptionByUser } from "@/lib/subscriptions";
import { type LayoutProps } from "@/typings";
import Loading from "@/components/Loading";
import { ROUTES } from "@/config/site";

export default async function Layout({ children }: LayoutProps) {
  const session = await getSession();

  if (!session?.user) {
    return redirect(ROUTES.signin.path);
  }

  const subscription = await getCurrentSubscriptionByUser(session.user);

  return (
    <div className="h-screen overflow-hidden">
      <DashboardHeader user={session.user} isAdmin={isAdmin(session.user)} />
      <div className="hidden md:fixed md:bottom-0 md:top-20 md:flex md:w-12 hover:w-72 transition-all duration-300 z-20 bg-white dark:bg-gray-900 shadow-lg">
        <DashboardSidebar
          isMobile={false}
          user={session.user}
          isAdmin={isAdmin(session.user)}
          subscription={subscription ?? undefined}
        />
      </div>
      <main
        className="fixed bottom-0 left-0 right-0 top-20 overflow-y-auto md:left-12"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="h-full py-6">
          <div className="mx-auto h-full px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
