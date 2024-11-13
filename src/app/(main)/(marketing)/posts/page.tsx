import ContentGrid from "@/components/cms/ContentGrid";
import PostTags from "@/components/cms/PostTags";
import { ROUTES, SITE } from "@/config/site";
import { getPostTags, getAllPublishedPosts } from "@/lib/cms";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default async function Page({ searchParams }: any) {
  const pathname = ROUTES.posts.path;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit) : 3;
  const tags = searchParams.tags ? searchParams.tags.split(",") : undefined;
  const { posts } = await getAllPublishedPosts({
    page,
    limit,
    tags,
  });
  const allTags = getPostTags();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
      <div className="container mx-auto py-8">
        <div className="max-w-3xl">
          <h1 className="h1">{SITE.name} resources</h1>
          <h2 className="text-secondary-600 mt-4 whitespace-pre-wrap text-lg font-normal lg:text-xl">
            All things you need to launch your MVP
          </h2>
        </div>
        <div className="mt-12">
          <PostTags
            tags={allTags}
            pathname={pathname}
            query={searchParams}
            className="badge badge-lg font-medium"
            showAll
          />
        </div>
        {posts.length > 0 ? (
          <ContentGrid items={posts} collection="posts" priority />
        ) : (
          <Link href={ROUTES.posts.path} className="">
            <div className="flex flex-col items-center justify-center gap-6 py-64">
              <RotateCcw />
              <span>
                You&apos;ve reached the end, go to {ROUTES.posts.title} page
              </span>
            </div>
          </Link>
        )}

        <div className="flex justify-center gap-1">
          {page > 1 && (
            <Link
              href={{
                pathname,
                query: { ...searchParams, ...{ page: page - 1 } },
              }}
              className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180"
            >
              <span className="sr-only">Prev Page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          )}

          <div>
            <label htmlFor="PaginationPage" className="sr-only">
              Page
            </label>

            <input
              type="number"
              className="border-color h-8 w-12 rounded border text-center text-xs font-medium [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              disabled
              value={page}
              id="PaginationPage"
            />
          </div>

          {posts.length >= limit && (
            <Link
              href={{
                pathname,
                query: { ...searchParams, ...{ page: page + 1 } },
              }}
              className="border-color inline-flex size-8 items-center justify-center rounded border"
            >
              <span className="sr-only">Next Page</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
