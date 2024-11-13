import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { MENUS } from "@/config/site";
import MainHeaderButtonGroup from "@/components/MainHeaderButtonGroup";
import MainHeaderDropdownMenu from "@/components/MainHeaderDropdownMenu";
import ThemedLogo from "@/components/ThemedLogo";
import Link from "next/link";
import { getDictionary } from "@/dictionaries";

export default async function MainHeader() {
  const t = (await getDictionary())["Common"];

  return (
    <header className="fixed top-0 z-40 flex h-16 w-full items-center border-b border-slate-50/[0.01] backdrop-blur-lg transition-colors duration-500">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 ">
        <div className="flex-shrink-0">
          <ThemedLogo />
        </div>

        <div className="hidden flex-auto items-center justify-start space-x-10 px-10 lg:flex xl:space-x-16 xl:px-16">
          {MENUS.mainNavigation.map((menu, index) => (
            <Link
              key={index}
              href={menu.path}
              title={menu.title}
              className="transition-color text-lg font-bold capitalize hover:text-primary"
            >
              {(t as any)[menu.title]}
            </Link>
          ))}
        </div>

        <div className="hidden flex-auto items-center justify-end space-x-3 lg:flex">
          <div className="mx-3 flex items-center">
            <ThemeSwitcher />
          </div>
          <MainHeaderButtonGroup />
        </div>
        <div className="flex items-center justify-end space-x-3 lg:hidden">
          <ThemeSwitcher />
          <MainHeaderDropdownMenu />
        </div>
      </div>
    </header>
  );
}