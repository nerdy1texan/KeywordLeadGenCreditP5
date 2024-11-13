import { getDictionary } from "@/dictionaries";

export default async function AboutMission() {
  const t = (await getDictionary())["AboutUs"]["mission"];
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-semibold mb-4 text-primary">{t.title}</h2>
      <p className="text-lg text-gray-400">{t.description}</p>
    </section>
  );
}