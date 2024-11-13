import Plans from "@/components/Plans";

export default function Page() {
  return (
    <main className="grow">
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="pb-12 pt-32 md:pb-20 md:pt-40">
            <Plans />
          </div>
        </div>
      </section>
    </main>
  );
}
