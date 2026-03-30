export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-[var(--muted)] rounded w-40" />
          <div className="h-10 bg-[var(--muted)] rounded w-44" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 bg-[var(--muted)] rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading dashboards...</span>
    </div>
  );
}
