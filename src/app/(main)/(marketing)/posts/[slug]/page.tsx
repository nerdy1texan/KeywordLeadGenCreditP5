import PostTags from "@/components/cms/PostTags";
import MDXComponent from "@/components/cms/mdx/MDXComponent";
import { ROUTES, SITE } from "@/config/site";
import { getPublishedDocumentSlugs, getPublishedPostBySlug } from "@/lib/cms";
import { absoluteUrl, formatDate, ogUrl } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";
import Link from "next/link";
import SocialShare from "@/components/cms/SocialShare";
interface Params {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: absoluteUrl(`/posts/${post.slug}`),
      images: [
        {
          url: post?.coverImage || ogUrl(post.title),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post?.coverImage || ogUrl(post.title)],
    },
  };
}

export default async function Page({ params }: Params) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="breadcrumbs flex flex-row items-center text-sm font-medium">
        <ul>
          <li>
            <Link href={ROUTES.home.path}>{ROUTES.home.title}</Link>
          </li>
          <li>
            <Link href={ROUTES.posts.path}>{ROUTES.posts.title}</Link>
          </li>
          <li>
            <p className="max-w-64 truncate text-primary">{post.title}</p>
          </li>
        </ul>
      </div>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-6 lg:mb-0">
          <PostTags post={post} pathname={ROUTES.posts.path} query={{}} />
          <dl>
            <dt className="sr-only">Published on</dt>
            <dd className="flex items-center gap-1 text-base font-medium leading-6 text-gray-500">
              <Calendar className="h-5 w-5" />
              <time>{formatDate(post.publishedAt)}</time>
            </dd>
          </dl>
        </div>
        <div className="space-y-6 text-left lg:py-10">
          <h1 className="h1">{post.title}</h1>
          <p className="text-lg font-medium text-gray-500">
            {post.description}
          </p>
        </div>

        <div className="flex flex-row justify-center gap-32 py-8">
          <div className="hidden w-64 lg:block">
            {post.author && (
              <div className="block">
                <div className="relative mb-4 block h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    alt={post.author.name!}
                    fill
                    src={post.author.picture!}
                    objectFit="contain"
                  />
                </div>
                <span className="mt-5 text-xl font-bold">
                  {post.author?.name}
                </span>
                <p className="mt-4 text-base font-normal text-gray-500">
                  Founder of {SITE.name}
                </p>
              </div>
            )}
            <ul className="mt-8 flex items-center gap-3">
              <SocialShare post={post} />
            </ul>
          </div>
          <div className="w-full">
            {post.coverImage && (
              <div className="mb-8">
                <img
                  src={post.coverImage}
                  className="border-color w-full rounded-lg border shadow-lg"
                  alt={post.slug}
                />
              </div>
            )}
            <div className="mb-8 lg:hidden">
              <div className="my-3 ml-1 text-sm font-medium text-gray-500">
                Posted by:
              </div>
              <div className="flex items-center gap-4 rounded-xl p-4">
                <img
                  alt={post.author?.name}
                  src={post.author?.picture}
                  className="size-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-medium">{post.author?.name}</h3>
                  <div className="flow-root flex-wrap text-gray-500">
                    Founder of {SITE.name}
                  </div>
                </div>
              </div>
            </div>
            <div className="prose-outstatic prose">
              <MDXComponent content={post.content} />
            </div>
            <ul className="my-12 flex items-center justify-end gap-3">
              <SocialShare post={post} />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const posts = await getPublishedDocumentSlugs("posts");
  return posts.map((slug) => ({ slug }));
}
