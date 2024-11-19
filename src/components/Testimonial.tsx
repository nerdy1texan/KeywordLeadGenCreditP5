import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { getDictionary } from "@/dictionaries";
import Image from "next/image";

const testimonials = [
  {
    avatar: "/testimonials/John.jpg",
    name: "John D.",
    title: "Growth Marketing Lead",
    text: "KeywordLeadGen transformed our Reddit lead generation strategy. The AI-powered subreddit discovery and intent detection helped us find high-quality leads we would've missed. Our conversion rate increased by 45% in just two months!",
    url: "",
    icon: <Github />,
  },
  {
    avatar: "/testimonials/Alice.jpg",
    name: "Alice M.",
    title: "Community Manager",
    text: "The Smart Reply Assistant in KeywordLeadGen is a game-changer. It helps us engage authentically with potential customers across multiple subreddits while saving hours daily. Our response rate has doubled since using the platform!",
    url: "",
    icon: <Instagram />,
  },
  {
    avatar: "/testimonials/Katty.jpg",
    name: "Katty L.",
    title: "B2B Sales Director",
    text: "KeywordLeadGen makes Reddit lead generation incredibly efficient. The AI automatically identifies high-intent discussions, and the analytics help us optimize our engagement strategy. We've reduced our customer acquisition cost by 60%!",
    url: "",
    icon: <Linkedin />,
  },
  {
    avatar: "/testimonials/John.jpg",
    name: "Mark S.",
    title: "SaaS Founder",
    text: "As a startup founder, KeywordLeadGen has been invaluable for growth. The automated subreddit monitoring and lead scoring help us find perfect-fit customers on Reddit. We've generated over 200 qualified leads in our first month!",
    url: "",
    icon: <Twitter />,
  },
  {
    avatar: "/testimonials/Katty.jpg",
    name: "Sarah R.",
    title: "Digital Marketing Consultant",
    text: "The competitor tracking feature in KeywordLeadGen gives us a huge advantage. We can monitor competitor mentions across Reddit and identify new opportunity spaces instantly. It's like having a full-time Reddit research team!",
    url: "",
    icon: <Linkedin />,
  },
  {
    avatar: "/testimonials/John.jpg",
    name: "David C.",
    title: "Product Marketing Manager",
    text: "KeywordLeadGen's intent detection AI is incredibly accurate. It helps us find users actively looking for solutions like ours on Reddit. The automated lead scoring saves us hours of manual work and the leads convert amazingly well!",
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
