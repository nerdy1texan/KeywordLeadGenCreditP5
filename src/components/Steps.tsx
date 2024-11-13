import { SectionHeader } from "@/components/SectionHeader";
import { Github, Rocket, ShoppingCart } from "lucide-react";
import { getDictionary } from "@/dictionaries";

export default async function Steps() {
  const t = (await getDictionary())["Steps"];
  const stepsText = t["steps"];
  const steps = [
    {
      icon: <ShoppingCart />,
      ...stepsText[0],
    },
    {
      icon: <Github />,
      ...stepsText[1],
    },
    {
      icon: <Rocket />,
      ...stepsText[2],
    },
  ];
  return (
    <section id="steps" className="bg-base-200/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <SectionHeader title={t["title"]} description={t["description"]} />
        <ul className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-10 lg:max-w-5xl lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="group relative flex items-center lg:flex-col lg:justify-center lg:text-center"
            >
              {index != steps.length - 1 && (
                <span
                  className="absolute left-[35px] top-20 h-[calc(100%_-_35px)] w-1.5 rounded-2xl bg-gray-300 lg:left-auto lg:right-[-130px] lg:top-[38px] lg:h-px lg:w-[calc(100%_-_72px)] "
                  aria-hidden="true"
                ></span>
              )}
              <div className="border-color inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border shadow-[0_0_15px_5px_#dbe0e2] transition-all duration-200 group-hover:border-primary ">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 group-hover:text-primary"
                >
                  {step.icon}
                </svg>
              </div>
              <div className="ml-6 lg:ml-0 lg:mt-8">
                <h3 className="text-xl font-bold before:mb-2 before:block before:font-mono before:text-sm group-hover:text-primary">
                  {step.title}
                </h3>
                <h4 className="mt-2 text-base text-gray-700">
                  {step.description}
                </h4>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
