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
    <div className="flex min-h-0 flex-1 flex-col w-56 bg-white dark:bg-gray-900">
      <div className={clsx(
        !isMobile && "hidden",
        "relative flex flex-shrink-0 items-center p-3"
      )}>
        <ThemedLogo className="block h-6 w-auto" />
      </div>
      
      {/* User info section */}
      <div className="relative flex flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-800">
        <a href={ROUTES.settings.path} className="group block w-full flex-shrink-0">
          <div className="flex items-center">
            <Avatar user={user} className="inline-block h-8 w-8" />
            <div className="ml-2">
              <p className="text-clip font-medium">{user.name}</p>
              <p className="text-xs font-medium text-secondary">
                {getCurrentPlanOffering(subscription).productName}
              </p>
            </div>
          </div>
        </a>
      </div>

      {/* Navigation section */}
      <div className="flex flex-col flex-1 justify-between">
        <nav className="space-y-3 py-3">
          {MENUS.dashboardNavigation.map((menu, index) => {
            const Icon = (icons as any)[menu.icon];
            if (!menu.isAdmin || isAdmin)
              return (
                <Link
                  key={index}
                  href={menu.path}
                  onClick={() => onClick && onClick()}
                >
                  <div className={clsx(
                    activeMenuIndex == index && "bg-gray-100 dark:bg-gray-800",
                    "flex items-center px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  )}>
                    <Icon className="mr-2 h-5 w-5 flex-shrink-0" />
                    <div>{menu.title}</div>
                  </div>
                </Link>
              );
          })}
        </nav>

        {/* Sign out button at bottom */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center px-3 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <icons.LogOut className="mr-2 h-5 w-5 flex-shrink-0" />
            <div>Sign Out</div>
          </button>
        </div>
      </div>
    </div>
  );
}