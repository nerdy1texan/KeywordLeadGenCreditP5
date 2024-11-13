import { type ReactNode } from "react";

export default function DashboardPageHeader({
  breadcrumbs,
  rightSubHeader,
}: {
  breadcrumbs: string[];
  rightSubHeader?: ReactNode;
}) {
  return (
    <nav className="duration-250 ease-soft-in shadow-blur -z-10 mb-3 flex flex-wrap items-center justify-between space-y-3 rounded-lg bg-base-100 px-3 py-3 shadow-none backdrop-blur-[30px] backdrop-saturate-[200%] transition-all md:space-y-0">
      <div className="h4 break-all">{breadcrumbs?.join("/")} ✨</div>
      {rightSubHeader}
    </nav>
  );
}
