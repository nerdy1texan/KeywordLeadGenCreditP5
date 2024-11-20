import { getDictionary } from "@/dictionaries";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import Image from "next/image";

export default async function FeatureZigzag() {
  const t = (await getDictionary())["FeatureZigzag"];
  return (
    <section id="features" className="bg-white dark:bg-[var(--primary-dark)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--secondary-light)] dark:from-[var(--secondary-dark)] opacity-10 pointer-events-none" />
      
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20 relative z-10">
        <SectionHeader
          title={<div dangerouslySetInnerHTML={{ __html: t["title"] }} />}
          description={
            <div dangerouslySetInnerHTML={{ __html: t["description"] }} />
          }
        />
        <div className="grid gap-24">
          {t["features"].map((feature: any, index: number) => (
            <div
              key={index}
              className="items-center md:grid md:grid-cols-12 md:gap-16"
            >
              <div
                className={`mx-auto mb-8 max-w-xl md:col-span-5 md:mb-0 md:w-full md:max-w-none lg:col-span-6 ${
                  index % 2 === 0 ? 'md:order-1' : ''
                }`}
                data-aos="fade-up"
              >
                <div className="max-w-[540px] mx-auto">
                  <RainbowWrapper className="relative z-0 p-[2px] rounded-2xl inline-block w-full">
                    <div className="image-3d-wrapper transform-gpu transition-all duration-300 hover:scale-[1.02] hover:translate-y-[-4px]">
                      <div className="thick-gradient-border p-2 rounded-2xl shadow-lg">
                        <Image
                          className="w-full rounded-xl"
                          src={`/features/feature-${index}.gif`}
                          width="540"
                          height="405"
                          alt={feature.title}
                          unoptimized
                        />
                      </div>
                    </div>
                  </RainbowWrapper>
                </div>
              </div>
              <div
                className="mx-auto max-w-xl md:col-span-7 md:w-full md:max-w-none lg:col-span-6"
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              >
                <div className={`md:${index % 2 === 0 ? 'pr' : 'pl'}-12 lg:${index % 2 === 0 ? 'pr' : 'pl'}-20`}>
                  <h3 className="h4 bg-gradient-to-r from-[var(--accent-base)] to-[#b06ab3] text-transparent bg-clip-text mb-6">
                    {feature.title}
                  </h3>
                  <p className="mb-6 text-xl text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                  <ul className="-mb-2 text-lg text-gray-500 dark:text-gray-400">
                    {feature.highlights.map(
                      (highlight: string, highlightIndex: number) => (
                        <li key={highlightIndex} className="mb-2 flex items-center">
                          <span className="mr-2 flex-shrink-0 rounded-full bg-gradient-to-r from-[var(--accent-base)] to-[#b06ab3] p-1">
                            <svg
                              className="h-4 w-4 text-white"
                              viewBox="0 0 12 12"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" fill="currentColor" />
                            </svg>
                          </span>
                          <span>{highlight}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
