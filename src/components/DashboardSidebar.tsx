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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronRight } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    MENUS.dashboardNavigation.forEach((menu, index) => {
      if (menu.path == pathname) {
        setActiveMenuIndex(index);
      }
    });
  }, [pathname]);

  return (
    <TooltipProvider>
      <div 
        className={clsx(
          "flex min-h-0 flex-1 flex-col bg-white dark:bg-gray-900",
          isMobile ? "w-full" : "transition-all duration-300 relative",
          !isMobile && (isExpanded ? "w-56" : "w-12")
        )}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {/* Expand arrow - only show on desktop */}
        {!isMobile && (
          <div className="absolute -right-2 top-6 bg-white dark:bg-gray-900 rounded-full p-0.5 border border-gray-200 dark:border-gray-800 cursor-pointer shadow-sm">
            <ChevronRight className={clsx(
              "w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </div>
        )}

        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center p-4">
            <ThemedLogo className="h-8 w-auto" />
          </div>
        )}
        
        {/* User info section */}
        {isMobile && (
          <div className="border-t border-b border-gray-200 dark:border-gray-800 p-4">
            <Link href={ROUTES.settings.path} className="flex items-center">
              <Avatar user={user} className="h-8 w-8" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {getCurrentPlanOffering(subscription).productName}
                </p>
              </div>
            </Link>
          </div>
        )}

        {!isMobile && (
          <div className={clsx(
            "relative flex flex-shrink-0 border-b border-gray-200 dark:border-gray-800 p-2"
          )}>
            <Link href={ROUTES.settings.path} className="group block w-full flex-shrink-0">
              <div className={clsx(
                "flex items-center",
                !isExpanded && "justify-center"
              )}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar user={user} className="h-6 w-6" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{user.name}</p>
                    <p className="text-xs">{getCurrentPlanOffering(subscription).productName}</p>
                  </TooltipContent>
                </Tooltip>
                {isExpanded && (
                  <div className="ml-2 overflow-hidden">
                    <p className="truncate font-medium text-sm">{user.name}</p>
                    <p className="text-xs font-medium text-secondary truncate">
                      {getCurrentPlanOffering(subscription).productName}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        {/* Navigation section */}
        <div className="flex flex-col flex-1 justify-between">
          <nav className={clsx(
            isMobile ? "px-2 pt-2" : "py-2",
            isMobile ? "space-y-1" : "space-y-1"
          )}>
            {MENUS.dashboardNavigation.map((menu, index) => {
              const Icon = (icons as any)[menu.icon];
              if (!menu.isAdmin || isAdmin)
                return (
                  <div key={index}>
                    {!isMobile ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={menu.path} onClick={() => onClick && onClick()}>
                            <div className={clsx(
                              activeMenuIndex == index && "bg-gray-100 dark:bg-gray-800",
                              "flex items-center transition-colors duration-200",
                              "px-2 py-2 text-sm",
                              !isExpanded && "justify-center",
                              "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}>
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              {isExpanded && <div className="ml-2">{menu.title}</div>}
                            </div>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {menu.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link href={menu.path} onClick={() => onClick && onClick()}>
                        <div className={clsx(
                          activeMenuIndex == index && "bg-gray-100 dark:bg-gray-800",
                          "flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}>
                          <Icon className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                          <span className="ml-3">{menu.title}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
            })}
          </nav>

          {/* Sign out button at bottom */}
          <div className="mt-auto">
            {!isMobile ? (
              <div className="border-t border-gray-200 dark:border-gray-800">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => signOut()}
                      className={clsx(
                        "flex w-full items-center transition-colors duration-200",
                        "px-2 py-2 text-sm",
                        !isExpanded && "justify-center",
                        "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <icons.LogOut className="h-4 w-4 flex-shrink-0" />
                      {isExpanded && <div className="ml-2">Sign Out</div>}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Sign Out
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-sm font-medium text-gray-900 dark:text-white"
                >
                  <icons.LogOut className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="ml-3">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}