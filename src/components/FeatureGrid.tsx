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

type FeatureProps = {
  icon: ReactNode;
  title?: string;
  highlight?: string;
};

function Feature({ icon, title, highlight }: FeatureProps) {
  return (
    <div className="text-left">
      <div className="mb-1 flex items-center space-x-2">
        {icon}
        <p className="h6 font-medium">{title}</p>
      </div>
      <p className="text-slate-400">{highlight}</p>
    </div>
  );
}

function FeatureRow({ features }: { features: FeatureProps[] }) {
  return (
    <div className="py-8 first-of-type:pt-0 last-of-type:pb-0">
      <div className="mb-2 grid gap-8 md:grid-cols-3 md:gap-12">
        {features.map((feature, index) => (
          <Feature key={index} {...feature} />
        ))}
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
      <div className="bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px] ">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
          <SectionHeader title={t["title"]} description={t["description"]} />
          <div className="divide-y divide-primary/10">
            {features.map((feature, index) => (
              <FeatureRow key={index} features={feature.features} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
