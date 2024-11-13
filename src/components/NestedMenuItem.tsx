"use client";
import { MENUS, ROUTES } from "@/config/site";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { Fragment } from "react";

export default function NestedMenuItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Menu as="div" className="relative z-40 flex-shrink-0">
      <Menu.Button>{children}</Menu.Button>
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
          {MENUS.additionalPages.map((menu) => (
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
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
