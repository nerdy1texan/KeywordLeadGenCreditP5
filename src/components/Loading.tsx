export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex items-center justify-center rounded-xl p-3">
        <div className="loading loading-infinity w-16 text-primary"></div>
      </div>
    </div>
  );
}
