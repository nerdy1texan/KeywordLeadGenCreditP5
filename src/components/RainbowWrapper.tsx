interface RainbowWrapper {
  children: React.ReactNode;
}
export function RainbowWrapper({ children }: RainbowWrapper) {
  return (
    <div className="group relative inline-flex w-full">
      <div className="transitiona-all -inset-py absolute -inset-px rounded-xl bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] opacity-50 blur-lg filter duration-1000 group-hover:-inset-1 group-hover:opacity-100 group-hover:duration-200"></div>
      <div
        aria-label="Primary button"
        className="flex-shrink-1 relative inline-flex w-full items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 "
      >
        {children}
      </div>
    </div>
  );
}
