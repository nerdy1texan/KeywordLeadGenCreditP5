import { ROUTES } from "@/config/site";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import Image from "next/image";
export async function Hero() {
  const t = (await getDictionary())["Hero"];
  return (
    <section className="bg-gradient-to-br from-primary/30 via-base-200/20 to-base-100/10 ">
      <div className="bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pt-16">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="px-6 text-lg font-extrabold"
              dangerouslySetInnerHTML={{ __html: t["subtitle"] }}
            />
            <p className="mt-5 text-4xl font-bold leading-tight sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight">
              {t["title"]}
              <span className="relative inline">
                <span
                  data-aos="slide-right"
                  className="absolute inset-0 h-full w-full bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-30 blur-lg filter"
                ></span>
                <span className="relative">{t["titleHighlight"]}</span>
              </span>
            </p>
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
              <div
                className="mt-4 font-medium"
                dangerouslySetInnerHTML={{ __html: t["promo"] }}
              />
            </div>
            <div className="my-8 px-8 sm:flex sm:items-center sm:justify-center sm:space-x-5 sm:px-0">
              <Link
                href={ROUTES.pricing.path}
                title={ROUTES.pricing.title}
                className="moving-border inline-flex w-full items-center justify-center rounded-xl border-2 border-transparent bg-gray-800 px-8 py-3 text-lg font-bold text-white transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 sm:w-auto"
                role="button"
              >
                {t["leftButton"]}
              </Link>
              <Link
                href={ROUTES.aboutUs.path}
                title={ROUTES.aboutUs.title}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-gray-400 px-6 py-3 text-lg font-bold  transition-all duration-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white focus:border-gray-900 focus:bg-gray-900 focus:text-white focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 sm:mt-0 sm:w-auto"
                role="button"
              >
                <Rocket className="mr-2 h-5 w-5 animate-bounce text-primary" />
                {t["rightButton"]}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
