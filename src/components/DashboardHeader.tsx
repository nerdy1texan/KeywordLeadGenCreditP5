"use client";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { Bell, MenuIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, useState } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { X } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { type User } from "@prisma/client";
import ThemedLogo from "@/components/ThemedLogo";
import { MENUS, ROUTES } from "@/config/site";
import Avatar from "@/components/Avatar";
import { signOut } from "next-auth/react";

export default function DashboardHeader({
  user,
  isAdmin,
}: {
  user: User;
  isAdmin: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex md:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex w-56 flex-col bg-white dark:bg-gray-900">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute right-0 top-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <DashboardSidebar
                isAdmin={isAdmin}
                isMobile={true}
                user={user}
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-900/10 dark:border-slate-50/[0.06]">
        <div className="relative flex h-20 items-center justify-between bg-base-100 px-8 backdrop-blur-md">
          <div>
            <div className="hidden flex-shrink-0 items-center gap-2 md:flex">
              <ThemedLogo className="block h-10 w-auto" />
            </div>
            <div className="flex items-center justify-start md:hidden">
              <MenuIcon
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 cursor-pointer"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-6">
            <Link href={ROUTES.tutorials.path}>
              <div className="bg-[#5244e1] hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Tutorials
              </div>
            </Link>
            <ThemeSwitcher />
            <div className="tooltip tooltip-bottom" data-tip="Notifications">
              <span className="sr-only">View notifications</span>
              <Bell className="h-7 w-7" aria-hidden="true" />
            </div>

            <Menu as="div" className="relative z-40 flex-shrink-0">
              <Menu.Button className="flex items-center rounded-full">
                <Avatar user={user} className="h-10 w-10" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-auto origin-top-right rounded-md bg-base-100 px-2 py-2 shadow-xl ring-2 ring-base-content ring-opacity-5 focus:outline-none">
                  {MENUS.dashboardNavigation.map((menu) => {
                    if (!menu.isAdmin || isAdmin)
                      return (
                        <Menu.Item key={menu.title}>
                          {() => (
                            <Menu.Button as={Link} href={menu.path}>
                              <div
                                className={`group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium capitalize hover:bg-primary hover:text-primary-content`}
                                style={{
                                  whiteSpace: "pre",
                                }}
                              >
                                {menu.title}
                              </div>
                            </Menu.Button>
                          )}
                        </Menu.Item>
                      );
                  })}
                  <Menu.Item>
                    {() => (
                      <button
                        onClick={() => signOut()}
                        className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Sign Out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>
    </>
  );
}
