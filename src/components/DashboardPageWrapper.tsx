import clsx from "clsx";
import React from "react";

export function DashboardPageWrapper({
  title,
  subTitle,
  children,
  className,
}: {
  title?: string;
  subTitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("p-6", className && className)}>
      <div className="mb-6">
        {title && <p className="h4">{title}</p>}
        {subTitle && <p className="mt-1 text-sm">{subTitle}</p>}
      </div>
      {children}
    </div>
  );
}
