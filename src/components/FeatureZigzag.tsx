import { getDictionary } from "@/dictionaries";
import { RainbowWrapper } from "@/components/RainbowWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import Image from "next/image";

export default async function FeatureZigzag() {
  const t = (await getDictionary())["FeatureZigzag"];
  return (
    <section id="features" className="bg-base-200/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <SectionHeader
          title={<div dangerouslySetInnerHTML={{ __html: t["title"] }} />}
          description={
            <div dangerouslySetInnerHTML={{ __html: t["description"] }} />
          }
        />
        <div className="grid gap-20">
          {t["features"].map((feature: any, index: number) => (
            <div
              key={index}
              className="items-center md:grid md:grid-cols-12 md:gap-6"
            >
              <div
                className={`mx-auto mb-8 max-w-xl md:col-span-5 md:mb-0 md:w-full md:max-w-none lg:col-span-6 ${
                  index % 2 === 0 ? 'md:order-1' : ''
                }`}
                data-aos="fade-up"
              >
                <RainbowWrapper>
                  <Image
                    className="w-full"
                    src={`/features/feature-${index}.gif`}
                    width="540"
                    height="405"
                    alt={feature.title}
                    unoptimized
                  />
                </RainbowWrapper>
              </div>
              <div
                className="mx-auto max-w-xl md:col-span-7 md:w-full md:max-w-none lg:col-span-6"
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              >
                <div className={`md:${index % 2 === 0 ? 'pr' : 'pl'}-4 lg:${index % 2 === 0 ? 'pr' : 'pl'}-12 xl:${index % 2 === 0 ? 'pr' : 'pl'}-16`}>
                  <div className="h4 text-primary">{feature.title}</div>
                  <p className="mb-4 text-xl text-gray-400">
                    {feature.description}
                  </p>
                  <ul className="-mb-2 text-lg text-gray-400">
                    {feature.highlights.map(
                      (highlight: string, highlightIndex: number) => (
                        <li key={highlightIndex} className="mb-2 flex items-center">
                          <svg
                            className="mr-2 h-3 w-3 shrink-0 fill-current text-green-500"
                            viewBox="0 0 12 12"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
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
