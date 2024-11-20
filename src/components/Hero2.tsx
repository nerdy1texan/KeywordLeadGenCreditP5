// src/components/Hero2.tsx

import { getDictionary } from "@/dictionaries";
import { Hero2Client } from "./Hero2Client";

export async function Hero2() {
  const t = (await getDictionary())["Hero"];
  return <Hero2Client dictionary={t} />;
}