import { remark } from "remark";
import html from "remark-html";
import { bundleMDX } from "mdx-bundler";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { getDocuments, load } from "outstatic/server";
import { type OstDocument } from "outstatic";
import * as fs from "fs/promises";
import { join } from "path";

const getOutStaticPath = (): string => {
  return join(process.cwd(), "outstatic");
};

const touched = { current: false };

// "Touch" the outstatic so that Vercel will include them in the production
// bundle. This is required because LeadNimbus dynamically access these files,
// so Vercel doesn't know about them by default
const touchOutStaticContent = (): void => {
  if (touched.current) return; // only need to do once

  /* eslint-disable  @typescript-eslint/no-floating-promises */
  fs.readdir(getOutStaticPath()); // fire and forget
  touched.current = true;
};

touchOutStaticContent();

export type PostTag = { value: string; label: string };
export type Post = {
  tags?: PostTag[];
} & OstDocument;

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export async function MDXServer(code: string) {
  const result = await bundleMDX({
    source: code,
    mdxOptions(options) {
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: "dracula",
            // The rest of the rehypePrettyCode config
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["hash-anchor"],
            },
          },
        ],
      ];
      return options;
    },
  });

  return result.code;
}

export async function getAllPublishedPosts({
  limit,
  page,
  tags,
}: {
  limit: number;
  page: number;
  tags?: string;
}) {
  try {
    const db = await load();
    const query = { collection: "posts", status: "published" };
    if (tags) {
      (query as any).tags = {
        $elemMatch: { value: { $in: tags } },
      };
    }

    const posts = await db
      .find<Post>(query, [
        "title",
        "publishedAt",
        "slug",
        "author",
        "coverImage",
        "description",
        "tags",
      ])
      .skip((page - 1) * limit)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();

    return {
      posts,
    };
  } catch (e) {
    console.log(e);
    return {
      posts: [],
    };
  }
}

export async function getAllPublishedPages() {
  try {
    const db = await load();
    const query = { collection: "pages", status: "published" };
    const pages = await db
      .find<OstDocument>(query, ["title", "slug"])
      .toArray();
    return {
      pages,
    };
  } catch (e) {
    console.log(e);
    return {
      pages: [],
    };
  }
}

export async function getPublishedDocumentBySlug<T extends OstDocument>(
  collection: string,
  slug: string,
  fields: string[] = [
    "title",
    "publishedAt",
    "description",
    "slug",
    "author",
    "content",
    "coverImage",
  ]
) {
  const db = await load();
  const document = await db
    .find<T>({ collection: collection, slug: slug }, fields)
    .first();

  if (!document || !document.content) {
    return document;
  }

  const content = await MDXServer(document.content);
  return {
    ...document,
    content,
  };
}

export async function getPublishedPostBySlug(slug: string) {
  return await getPublishedDocumentBySlug<Post>("posts", slug, [
    "title",
    "publishedAt",
    "description",
    "slug",
    "author",
    "content",
    "coverImage",
    "tags",
  ]);
}

export function getPostTags() {
  const posts = getDocuments("posts", ["tags"]);
  const map: Map<string, PostTag> = new Map();
  if (posts) {
    for (const post of posts) {
      if (post["tags"]) {
        (post["tags"] as PostTag[]).forEach((tag) => {
          map.set(tag.value, tag);
        });
      }
    }
  }

  return Array.from(map.values());
}

export async function getPublishedDocumentSlugs(collection: string) {
  try {
    const db = await load();
    const query = { collection: collection };
    const documents = await db.find<OstDocument>(query, ["slug"]).toArray();
    return documents.map((document) => document.slug);
  } catch (e) {
    console.log(e);
    return [];
  }
}
