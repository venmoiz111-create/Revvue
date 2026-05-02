// Skeleton loader for any dashboard route. Kept simple and content-shaped
// so it doesn't flash a different layout before the real content arrives.
export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-1/3 rounded-md bg-stone-200" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-stone-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-stone-200 bg-white" />
    </div>
  );
}
