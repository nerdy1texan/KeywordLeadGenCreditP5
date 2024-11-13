"use client";
import clsx from "clsx";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <label
      className={clsx("swap swap-rotate", theme == "light" && "swap-active")}
      onClick={() => {
        setTheme(theme == "dark" ? "light" : "dark");
      }}
    >
      <Sun className={"swap-on"} />
      <Moon className={"swap-off"} />
    </label>
  );
}
