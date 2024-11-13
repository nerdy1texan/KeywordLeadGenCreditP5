import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { getDictionary } from "@/dictionaries";
import Image from "next/image";
const testimonials = [
  {
    avatar: "/testimonials/John.jpg",
    name: "John D.",
    title: "Sales Consultant",
    text: "LeadNimbus has revolutionized my lead generation process. The AI-driven scrapers and keyword research tools helped me uncover valuable leads that I would've missed manually. A true game-changer for my business!",
    url: "",
    icon: <Github />,
  },
  {
    avatar: "/testimonials/Alice.jpg",
    name: "Alice M.",
    title: "Marketing Strategist",
    text: "The keyword and hashtag generator in LeadNimbus has transformed the way we optimize our campaigns. Our social media posts are now more targeted, and engagement has skyrocketed. The automation features are invaluable!",
    url: "",
    icon: <Instagram />,
  },
  {
    avatar: "/testimonials/Katty.jpg",
    name: "Katty L.",
    title: "Social Media Manager",
    text: "LeadNimbus makes social media scraping and lead generation incredibly easy. I use it to extract data from Facebook and Twitter (X) profiles, and the insights have been instrumental in crafting better outreach strategies. Highly recommended!",
    url: "",
    icon: <Linkedin />,
  },
  {
    avatar: "/testimonials/John.jpg",
    name: "Mark S.",
    title: "SaaS Founder",
    text: "LeadNimbus has been a game-changer for scaling our SaaS business. The AI scrapers allow us to automate lead generation and keep track of industry trends through real-time keyword monitoring. It saves us time and boosts productivity!",
    url: "",
    icon: <Twitter />,
  },
  
];
export default async function Testimonials() {
  const t = (await getDictionary())["Testimonials"];

  return (
    <section id="testimonials">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <SectionHeader title={t["title"]} description={t["description"]} />

        <div className="columns-1 gap-8 space-y-8 md:columns-3 md:gap-10 md:space-y-10 ">
          {Array.from(Array(9)).map((i, index) => {
            const testimonial =
              testimonials[Math.floor(testimonials.length * Math.random())]!;
            return (
              <div
                key={index}
                className="group relative break-inside-avoid-column text-wrap break-words"
              >
                <div className="duration-400 absolute -inset-1 rounded-lg bg-gradient-to-r from-sky-600 via-purple-600 to-pink-600 opacity-25 blur transition group-hover:opacity-100 group-hover:duration-200"></div>
                <a href={testimonial.url}>
                  <div className="relative space-y-6 rounded-lg bg-base-100 p-6 leading-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Image
                          width={48}
                          height={48}
                          src={testimonial.avatar}
                          className="rounded-full bg-cover bg-center"
                          alt={testimonial.name}
                        />
                        <div>
                          <h3 className="text-lg font-semibold">
                            {testimonial.name}
                          </h3>
                          <p className="text-md  text-gray-500">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                      <div className="transition hover:text-primary">
                        {testimonial.icon}
                      </div>
                    </div>

                    <p className="text-md base-content font-medium leading-normal text-gray-500 ">
                      {testimonial.text}
                    </p>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
