import clsx from "clsx";
import { type ReactNode } from "react";

export function Card({
  tooltip,
  onClick,
  children,
  className,
}: {
  tooltip?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  let props = {};
  if (tooltip) {
    props = {
      ...props,
      "data-tip": tooltip,
    };
  }

  if (onClick) {
    props = {
      ...props,
      onClick: onClick,
    };
  }

  return (
    <div
      className={clsx(
        "rounded-md border p-6",
        tooltip && "tooltip",
        onClick && "cursor-pointer hover:bg-base-200",
        className && className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
