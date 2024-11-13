"use client";
import { Popover, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { MENUS } from "@/config/site";
import MainHeaderButtonGroup from "@/components/MainHeaderButtonGroup";
import { useDictionary } from "@/components/DictionaryProvider";

export default function MainHeaderDropdownMenu() {
  const t = useDictionary()["Common"];
  return (
    <Popover>
      {({ open }) => (
        <>
          <Popover.Button
            id="menuButton"
            aria-label="Main Menu"
            className={"flex items-center outline-none"}
          >
            <div className={clsx("swap swap-rotate", open && "swap-active")}>
              <Menu className="swap-off" />
              <X className="swap-on" />
            </div>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-20 mt-3 w-full px-4 lg:hidden">
              <div className="overflow-hidden rounded-lg bg-base-100 p-7 shadow-xl ring-1 ring-base-content ring-opacity-5">
                <div className="relative grid gap-2">
                  {MENUS.mainNavigation.map((menu) => (
                    <Popover.Button
                      as={Link}
                      key={menu.title}
                      href={menu.path}
                      className="flex items-center justify-center rounded-lg border px-2 py-3 font-medium capitalize transition duration-150 ease-in-out hover:bg-primary hover:text-primary-content"
                    >
                      {(t as any)[menu.title]}
                    </Popover.Button>
                  ))}
                </div>
                <div className="mt-6 space-y-2">
                  <MainHeaderButtonGroup className="flex w-full items-center" />
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
