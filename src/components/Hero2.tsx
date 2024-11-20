import { ROUTES } from "@/config/site";
import Link from "next/link";

import { getDictionary } from "@/dictionaries";
import Image from "next/image";
import { ChevronRight, Rocket } from "lucide-react";
export async function Hero2() {
  const t = (await getDictionary())["Hero"];
  return (
    <section>
      <div className="pt-16">
        <div className="relative mx-auto max-w-7xl">
          <div className="absolute left-[0] top-[10%] h-[200px] w-[100%] md:h-[290px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="patternId"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="a"
                  patternUnits="userSpaceOnUse"
                  width="20"
                  height="20"
                  patternTransform="scale(3) rotate(0)"
                >
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="hsla(0, 0%, 100%, 0)"
                  ></rect>
                  <path
                    d="M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z"
                    strokeWidth="0.5"
                    className="stroke-base-content/30"
                    fill="none"
                  ></path>
                </pattern>
              </defs>
              <rect
                width="800%"
                height="800%"
                transform="translate(0,0)"
                fill="url(#a)"
              ></rect>
            </svg>
            <div className="absolute inset-0  bg-gradient-to-b from-base-100 from-20% to-transparent "></div>
            <div className="from-1% absolute  inset-0 bg-gradient-to-l from-base-100 to-transparent to-30%"></div>
            <div className="from-1% absolute  inset-0 bg-gradient-to-r from-base-100 to-transparent to-30%"></div>
            <div className="from-1% absolute  inset-0 bg-gradient-to-t from-base-100 to-transparent to-30%"></div>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 pb-8 text-center sm:px-6 md:py-20">
          <div className="shining group rounded-full bg-base-200 transition-all ease-in hover:cursor-pointer hover:bg-base-300">
            <div
              dangerouslySetInnerHTML={{ __html: t["promo"] }}
              className="bg-gradient-to-r from-transparent via-base-content via-50% to-transparent bg-clip-text bg-no-repeat px-4 py-1 font-medium text-base-content/40 transition ease-out
                 "
            ></div>
          </div>
          <h1 className="relative mx-auto text-balance px-4 py-2 pt-5 text-center text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[var(--accent-base)] to-[#b06ab3] bg-clip-text text-transparent">
              KeywordLeadGen
            </span>
            <br />
            <span className="block mt-2">
              Your{" "}
              <span className="bg-gradient-to-r from-[var(--accent-base)] to-[#b06ab3] bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Reddit Lead Generation Platform
            </span>
          </h1>
          <p
            className="max-w-[64rem] text-balance text-lg tracking-tight text-black dark:text-white md:text-xl"
            dangerouslySetInnerHTML={{ __html: t["subtitle"] }}
          />
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={ROUTES.pricing.path}
              title={ROUTES.pricing.title}
              className="shining text-md group relative inline-flex w-full items-center justify-center gap-1 whitespace-pre rounded-full border bg-primary px-8 py-2 font-semibold text-primary-content shadow-sm transition-colors hover:bg-secondary md:flex"
              role="button"
            >
              {t["leftButton"]}
              <ChevronRight className="ml-2 h-5 w-5 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
            <Link
              href={ROUTES.tutorials.path}
              title={ROUTES.tutorials.title}
              className="shining text-md group relative inline-flex w-full items-center justify-center gap-1 whitespace-pre rounded-full border px-8 py-2 font-semibold shadow-sm transition-colors hover:bg-base-200 hover:text-base-content md:flex"
              role="button"
            >
              {t["rightButton"]}
              <Rocket className="ml-2 h-5 w-5 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 flex-col items-center justify-center">
            <div className="avatar-group justify-center -space-x-5 rtl:space-x-reverse">
              {Array.from(Array(5)).map((x, i) => {
                return (
                  <div key={i} className="avatar">
                    <Image
                      height={40}
                      width={40}
                      src={`/hero/avatar-${i}.jpeg`}
                      alt="avatar"
                    />
                  </div>
                );
              })}
            </div>
            <div>
              <p
                className="mt-4 text-lg"
                dangerouslySetInnerHTML={{ __html: t["cta"] }}
              />
            </div>
            <div className="rating mt-4">
              {Array.from(Array(5)).map((x, i) => {
                return (
                  <input
                    key={i}
                    aria-label={`Rating ${i + 1}`}
                    type="radio"
                    name="rating-4"
                    className="mask mask-star-2 bg-primary"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}