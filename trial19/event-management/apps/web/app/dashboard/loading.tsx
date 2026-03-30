export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-4xl mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/3 mb-6" />
        <div className="h-4 bg-[var(--muted)] rounded w-2/3 mb-4" />
        <div className="h-4 bg-[var(--muted)] rounded w-1/2" />
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
