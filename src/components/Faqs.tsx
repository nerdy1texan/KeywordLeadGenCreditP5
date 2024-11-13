import { SectionHeader } from "@/components/SectionHeader";
import { getDictionary } from "@/dictionaries";

export default async function Faqs() {
  const t = (await getDictionary())["Faqs"];

  return (
    <section id="faqs">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <SectionHeader
          title={t["title"]}
          description={
            <div
              className="text-xl text-gray-500"
              dangerouslySetInnerHTML={{ __html: t["description"] }}
            />
          }
        />
        <div className="mx-auto mt-12 w-full text-left">
          {t["faqs"].map((faq: any, index: number) => (
            <div
              key={index}
              className="border-color collapse collapse-arrow my-3 border-2 focus:border-primary focus:text-primary"
            >
              <input type="checkbox" className="peer" aria-label={faq.q} />
              <div className="collapse-title mt-5 text-lg font-medium leading-6 peer-checked:text-primary">
                {faq.q}
              </div>
              <div className="collapse-content mt-2 text-base text-gray-500">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
