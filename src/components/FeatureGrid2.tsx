import {
  BadgeCent,
  CheckCircle,
  Component,
  DatabaseZap,
  Frame,
  KeyRound,
  Languages,
  Palette,
  Pencil,
  RemoveFormatting,
  Send,
  Wind,
} from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { type ReactNode } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import Spotlight, { SpotlightCard } from "./SpotlightCard";

type FeatureProps = {
  icon: ReactNode;
  title?: string;
  highlight?: string;
};

function Feature({ icon, title, highlight }: FeatureProps) {
  return (
    <div className="relative z-20 h-full overflow-hidden rounded-[inherit] p-6 pb-8 dark:bg-slate-900">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2"
        aria-hidden="true"
      >
        <div className="translate-z-0 absolute inset-0 rounded-full blur-[80px] dark:bg-slate-800"></div>
      </div>
      <div className="flex h-full flex-col items-center text-center">
        <div className="relative inline-flex text-base-content">
          <div
            className="absolute inset-0 -z-10 m-auto h-[40%] w-[40%] -translate-y-[10%] rounded-full bg-primary blur-3xl"
            aria-hidden="true"
          ></div>
          {icon}
        </div>
        <div className="mb-5 grow">
          <h2 className="mb-1 text-xl font-bold text-base-content">{title}</h2>
          <p className="text-sm text-gray-500">{highlight}</p>
        </div>
      </div>
    </div>
  );
}

export default async function FeatureGrid() {
  const t = (await getDictionary())["FeatureGrid"];
  const featuresText = t["features"];
  const features = [
    {
      title: "Backend",
      features: [
        {
          icon: <Frame />,
          ...featuresText[0],
        },
        {
          icon: <DatabaseZap />,
          ...featuresText[1],
        },
        {
          icon: <KeyRound />,
          ...featuresText[2],
        },
      ],
    },
    {
      title: "UI",
      features: [
        {
          icon: <Wind />,
          ...featuresText[3],
        },
        {
          icon: <Component />,
          ...featuresText[4],
        },
        {
          icon: <Pencil />,
          ...featuresText[5],
        },
      ],
    },
    {
      title: "Framework",
      features: [
        {
          icon: <BadgeCent />,
          ...featuresText[6],
        },
        {
          icon: <Send />,
          ...featuresText[7],
        },
        {
          icon: <CheckCircle />,
          ...featuresText[8],
        },
      ],
    },
    {
      title: "Framework",
      features: [
        {
          icon: <Palette />,
          ...featuresText[9],
        },
        {
          icon: <Languages />,
          ...featuresText[10],
        },
        {
          icon: <RemoveFormatting />,
          ...featuresText[11],
        },
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-tl from-primary/10 via-base-200/20 to-base-100/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20 ">
        <SectionHeader title={t["title"]} description={t["description"]} />
        <Spotlight className="group mx-auto grid grid-cols-1 items-start gap-6 sm:grid-cols-3 lg:max-w-none">
          {features.map((feature, i1) =>
            feature.features.map((feature, i2) => (
              <SpotlightCard key={`${i1}-${i2}`}>
                <Feature {...feature} />
              </SpotlightCard>
            ))
          )}
        </Spotlight>
      </div>
    </div>
  );
}
