import type { Post, PostTag } from "@/lib/cms";
import clsx from "clsx";
import Link from "next/link";
import { type ParsedUrlQueryInput } from "querystring";

export default function PostTags({
  post,
  tags,
  className = "badge-primary badge-outline badge-md",
  pathname,
  query,
  showAll,
}: {
  pathname?: string | null;
  query?: ParsedUrlQueryInput;
  post?: Post;
  tags?: PostTag[];
  className?: string;
  showAll?: boolean;
}) {
  const allTags = (post && Array.isArray(post.tags) ? post.tags : tags) ?? [];
  return allTags && allTags.length > 0 ? (
    <div className="flex items-center justify-start gap-2">
      {showAll && (
        <Link
          href={{
            pathname,
            query: { ...query, ...{ tags: undefined } },
          }}
          key={"all"}
          className={clsx(
            "badge",
            !query || !query.tags ? "badge-secondary" : "badge-outline",
            className
          )}
        >
          {"All"}
        </Link>
      )}
      {allTags.map(({ label, value }) => {
        const isActive =
          pathname &&
          query &&
          query.tags &&
          typeof query.tags === "string" &&
          query.tags.split(",").includes(value);

        return pathname ? (
          <Link
            href={{
              pathname,
              query: { ...query, ...{ tags: value } },
            }}
            key={label}
            className={clsx(
              "badge",
              className,
              isActive ? "badge-secondary" : "badge-outline"
            )}
          >
            {label}
          </Link>
        ) : (
          <div key={label} className={clsx("badge", className)}>
            {label}
          </div>
        );
      })}
    </div>
  ) : null;
}
