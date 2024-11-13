import clsx from "clsx";

interface SectionHeader {
  className?: string;
  children: React.ReactNode;
}

export default function SectionHeader2({ children, className }: SectionHeader) {
  return (
    <div className={clsx("mx-auto", className)}>
      <div className="relative mb-5 flex items-center justify-center gap-4 ">
        <div
          className="relative inline-flex whitespace-nowrap rounded-lg border bg-base-100 px-3 py-1 text-sm font-medium tracking-normal text-gray-700 shadow 
          [background-image:linear-gradient(120deg,transparent_0%,theme(colors.primary/.14)_33%,theme(colors.pink.400/.14)_66%,theme(colors.amber.200/.14)_100%)]"
        >
          <span className="relative text-base-content dark:bg-gradient-to-b dark:from-primary dark:to-white dark:bg-clip-text dark:text-transparent">
            {children}
          </span>
        </div>
      </div>
    </div>
  );
}
