import MDXComponent from "@/components/cms/mdx/MDXComponent";
import { absoluteUrl, ogUrl } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedDocumentBySlug,
  getPublishedDocumentSlugs,
} from "@/lib/cms";
interface Params {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = await getPublishedDocumentBySlug("pages", params.slug);
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      type: "article",
      url: absoluteUrl(`/pages/${page.slug}`),
      images: [
        {
          url: page?.coverImage || ogUrl(page.title),
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [page?.coverImage || ogUrl(page.title)],
    },
  };
}

export default async function Page({ params }: Params) {
  const page = await getPublishedDocumentBySlug("pages", params.slug);
  if (!page) {
    return notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
      <div className="container mx-auto py-8">
        {page.title && (
          <div className="space-y-6 text-left lg:py-10">
            <h1 className="h1">{page.title}</h1>
            {page.description && (
              <p className="text-lg font-medium text-gray-500">
                {page.description}
              </p>
            )}
          </div>
        )}

        <div className="gap-32 py-8">
          <div className="mb-8">
            {page.coverImage && (
              <img
                src={page.coverImage}
                className="border-color w-full rounded-lg border shadow-lg"
                alt={page.slug}
              />
            )}
          </div>
          <div className="prose-outstatic prose">
            <MDXComponent content={page.content} />
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const pages = await getPublishedDocumentSlugs("pages");
  return pages.map((slug) => ({ slug }));
}
