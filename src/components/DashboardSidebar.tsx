"use client";

// src/components/DashboardSidebar.tsx

import Link from "next/link";
import { useEffect, useState } from "react";
import { MENUS, ROUTES } from "@/config/site";
import * as icons from "lucide-react";
import type { Subscription, User } from "@prisma/client";
import ThemedLogo from "@/components/ThemedLogo";
import { getCurrentPlanOffering } from "@/lib/utils";
import clsx from "clsx";
import Avatar from "@/components/Avatar";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function DashboardSidebar({
  isMobile,
  user,
  subscription,
  onClick,
  isAdmin,
}: {
  isMobile: boolean;
  user: User;
  subscription?: Subscription;
  onClick?: () => void;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [activeMenuIndex, setActiveMenuIndex] = useState(-1);
  useEffect(() => {
    MENUS.dashboardNavigation.forEach((menu, index) => {
      if (menu.path == pathname) {
        setActiveMenuIndex(index);
      }
    });
  }, [pathname]);
  return (
    <div className="flex min-h-0 flex-1 flex-col w-56">
      <div
        className={clsx(
          !isMobile && "hidden",
          "relative flex flex-shrink-0 items-center bg-base-100 p-3"
        )}
      >
        <ThemedLogo className="block h-6 w-auto" />
      </div>
      <div className="shadow-inset relative flex flex-shrink-0 bg-base-100 p-3">
        <a
          href={ROUTES.settings.path}
          className="group block w-full flex-shrink-0 overflow-hidden"
        >
          <div className="flex items-center">
            <div>
              <Avatar user={user} className="inline-block h-8 w-8" />
            </div>
            <div className="ml-2">
              <p className="text-clip text-sm font-medium">{user.name}</p>
              <p className="text-xs font-medium text-secondary">
                {getCurrentPlanOffering(subscription).productName}
              </p>
            </div>
          </div>
        </a>
      </div>
      <div className="relative flex flex-1 flex-col overflow-y-auto bg-base-100 pb-4">
        <nav className="mt-4 flex-1 space-y-1 px-2">
          {MENUS.dashboardNavigation.map((menu, index) => {
            const Icon = (icons as any)[menu.icon];
            if (!menu.isAdmin || isAdmin)
              return (
                <Link
                  key={index}
                  href={menu.path}
                  onClick={() => onClick && onClick()}
                >
                  <div
                    className={clsx(
                      activeMenuIndex == index && "shadow-inset bg-base-200",
                      "group flex items-center rounded-md px-2 py-2 font-medium"
                    )}
                  >
                    <Icon className="mr-2 h-5 w-5 flex-shrink-0"></Icon>
                    <div>{menu.title}</div>
                  </div>
                </Link>
              );
          })}
        </nav>
        <div className="px-2 mt-2">
          <button
            onClick={() => signOut()}
            className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-base-200"
          >
            <icons.LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
            <div>Sign Out</div>
          </button>
        </div>
      </div>
    </div>
  );
}