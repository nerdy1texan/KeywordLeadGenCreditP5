import { getDictionary } from "@/dictionaries";

export default async function AboutContact() {
  const t = (await getDictionary())["AboutUs"]["contact"];
  return (
    <section className="text-center">
      <h2 className="text-3xl font-semibold mb-4 text-primary">{t.title}</h2>
      <p className="text-lg text-gray-400 mb-4">{t.description}</p>
      <a href={`mailto:${t.email}`} className="text-primary text-lg font-bold hover:underline">
        {t.email}
      </a>
    </section>
  );
}