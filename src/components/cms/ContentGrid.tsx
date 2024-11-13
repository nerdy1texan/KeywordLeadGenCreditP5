import type { Post } from "@/lib/cms";
import { ArrowRight } from "lucide-react";
import { formatDate, ogUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import PostTags from "@/components/cms/PostTags";

type Props = {
  collection: string;
  title?: string;
  items: Post[];
  priority?: boolean;
  viewAll?: boolean;
};

const ContentGrid = ({ items, collection, priority = false }: Props) => {
  return (
    <section id={collection} className="my-12">
      <div className="grid gap-20 lg:grid-cols-2">
        {items.map((item, id) => (
          <Link key={item.slug} href={`/${collection}/${item.slug}`}>
            <article className="border-color h-full scale-100 rounded-lg border p-6 transition duration-100 hover:scale-[1.02] hover:shadow active:scale-[0.97] motion-safe:transform-gpu motion-reduce:hover:scale-100">
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  position: "relative",
                }}
              >
                <Image
                  src={item.coverImage || ogUrl(item.title)}
                  className="rounded-lg"
                  alt=""
                  layout="fill"
                  objectFit="cover"
                  priority={priority && id <= 2}
                />
              </div>
              <div className="flex items-center justify-between py-3 text-gray-500">
                <PostTags post={item} />
                <span className="text-sm">{formatDate(item.publishedAt)}</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="mb-5 font-light text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-7 w-7 rounded-full"
                    src={item.author?.picture}
                    alt={item.author?.name}
                  />
                  <span className="font-medium dark:text-white">
                    {item.author?.name}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContentGrid;
