import { SectionHeader } from "@/components/SectionHeader";
import Plans from "@/components/Plans";
import { getDictionary } from "@/dictionaries";

export default async function Pricing() {
  const t = (await getDictionary())["Pricing"];
  return (
    <section id="pricing" className="bg-base-200/20">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <SectionHeader
          title={t["title"]}
          description={
            <div className="mt-2" data-aos="zoom-in-up">
              <span
                dangerouslySetInnerHTML={{ __html: t["description"] }}
                className="highlight inline-block rounded-md bg-secondary font-medium text-gray-50"
              />
            </div>
          }
        />
        <Plans />
      </div>
    </section>
  );
}
