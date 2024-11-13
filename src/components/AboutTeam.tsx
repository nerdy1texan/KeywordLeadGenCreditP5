import { getDictionary } from "@/dictionaries";
import Image from 'next/image';

export default async function AboutTeam() {
  const t = (await getDictionary())["AboutUs"]["team"];
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-semibold mb-4 text-primary">{t.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {t.members.map((member, index) => (
          <div key={index} className="text-center">
            <Image
              src={member.image}
              alt={member.name}
              width={128}
              height={128}
              className="rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-primary">{member.name}</h3>
            <p className="text-gray-400">{member.role}</p>
            <p className="mt-2 text-gray-400">{member.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}