// src/app/(main)/(marketing)/about-us/page.tsx
import { Metadata } from 'next';
import { getDictionary } from "@/dictionaries";
import AboutMission from "@/components/AboutMission";
import AboutWhatWeDo from "@/components/AboutWhatWeDo";
import AboutTeam from "@/components/AboutTeam";
import AboutContact from "@/components/AboutContact";

export const metadata: Metadata = {
  title: 'About Us | KeywordLeadGen',
  description: 'Learn about KeywordLeadGen, our mission, team, and how we revolutionize lead generation using AI.',
};

export default async function AboutUsPage() {
  const t = (await getDictionary())["AboutUs"];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
      <div className="container mx-auto py-8">
        <div className="max-w-3xl">
          <h1 className="h1">{t.title}</h1>
          <h2 className="text-secondary-600 mt-4 whitespace-pre-wrap text-lg font-normal lg:text-xl">
            {t.subtitle}
          </h2>
        </div>

        <div className="mt-12">
          <AboutMission />
          <AboutWhatWeDo />
          {/* <AboutTeam /> */}
          <AboutContact />
        </div>
      </div>
    </div>
  );
}