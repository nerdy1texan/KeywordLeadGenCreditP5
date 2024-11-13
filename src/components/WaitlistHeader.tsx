"use client";
import Link from "next/link";
import ThemedLogo from "@/components/ThemedLogo";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useDictionary } from "@/components/DictionaryProvider";
import { MENUS } from "@/config/site";

export default function WaitlistHeader() {
  const t = useDictionary()["Common"];

  return (
    <header className="fixed top-4 z-30 w-full pb-4 md:top-6 md:pb-6">
      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative flex h-14 items-center justify-between gap-x-2 rounded-lg px-3 shadow [background-image:linear-gradient(120deg,transparent_0%,theme(colors.primary/.14)_33%,theme(colors.pink.400/.14)_66%,theme(colors.amber.200/.14)_100%)]">
            <div className="flex-1">
              <ThemedLogo />
            </div>
            <nav className="flex justify-center">
              <ul className="flex items-center text-sm font-medium sm:gap-x-3">
                {MENUS.waitlistNavigation.map((menu, index) => (
                  <li key={index}>
                    <Link
                      className="btn btn-ghost btn-sm rounded-lg"
                      href={menu.path}
                    >
                      {(t as any)[menu.title]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
