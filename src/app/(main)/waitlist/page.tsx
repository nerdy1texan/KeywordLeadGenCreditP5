import BlurIn from "@/components/BlurIn";
import { Logo } from "@/components/MonochromeLogo";
import Newsletter2 from "@/components/Newsletter2";
import SectionHeader2 from "@/components/SectionHeader2";
import { SparklesCore } from "@/components/Sparkles";
import WaitlistHeader from "@/components/WaitlistHeader";
import { SITE } from "@/config/site";
import { getDictionary } from "@/dictionaries";
import Image from "next/image";

export default async function Waitlist() {
  const d = await getDictionary();
  const w = d["Waitlist"];
  const c = d["Common"];

  return (
    <div className="dark:bg-black/50">
      <WaitlistHeader />
      <div className="relative flex min-h-screen flex-col items-center px-4 pt-24 sm:px-6 md:pt-40">
        <div className="absolute left-0 right-0 m-auto mx-auto max-w-3xl">
          <div className="absolute inset-x-1/4 top-0 h-[2px] w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
          <div className="absolute inset-x-1/4 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="absolute inset-x-1/4 top-0 h-[5px] w-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
          <div className="absolute inset-x-1/4 top-0 h-px w-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="h-full w-full"
          />
          <div className="absolute inset-0 h-full w-full [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
        <div className="py-3"></div>
        <SectionHeader2>
          <div
            className="flex items-center space-x-2"
            dangerouslySetInnerHTML={{ __html: w["tag"] }}
          />
        </SectionHeader2>
        <BlurIn>
          <div className="mb-12 max-w-3xl text-center">
            <h1 className="font-display pb-4 text-5xl font-bold text-gray-800 drop-shadow-sm dark:bg-gradient-to-b dark:from-indigo-200 dark:to-gray-200 dark:bg-clip-text dark:text-transparent md:text-6xl">
              {"Stay Ahead: Exclusive Updates Just for You!"}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-400">
              {
                "Sign up to receive the latest news, tools, and insights. Stay ahead in the SaaS world with updates delivered right to your inbox. Don’t miss out—join us today!"
              }
            </p>
          </div>
        </BlurIn>
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <div className="avatar-group mb-4 justify-center -space-x-5 rtl:space-x-reverse">
              {Array.from(Array(5)).map((x, i) => {
                return (
                  <div key={i} className="avatar ">
                    <Image
                      height={32}
                      width={32}
                      className="shadow-[0_0_15px_5px_#dbe0e2]"
                      src={`/hero/avatar-${i}.jpeg`}
                      alt="avatar"
                    />
                  </div>
                );
              })}
            </div>
            <p
              className="text-sm text-gray-500"
              dangerouslySetInnerHTML={{ __html: w["cta"] }}
            />
          </div>
        </div>
        <Newsletter2 />
      </div>
      <p className="mt-8 border-t pt-6 text-center [border-image:linear-gradient(to_right,transparent,theme(colors.primary/.4),transparent)1]">
        <span className="mx-auto text-sm text-gray-500">
          {c["Copyright"]} © {new Date().getFullYear()}
          <a
            href={SITE.url}
            className="mx-2 text-primary hover:text-gray-500"
            rel="noopener noreferrer"
          >
            {SITE.name}
          </a>
        </span>
      </p>
      <div className="flex justify-center py-8">
        <button className="text-neutarl-700 flex gap-2 rounded-md border border-base-content bg-base-100 px-4 py-2 text-sm transition duration-200 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)]">
          <p className="font-medium">Built with</p> <Logo size={20} />
        </button>
      </div>
    </div>
  );
}
