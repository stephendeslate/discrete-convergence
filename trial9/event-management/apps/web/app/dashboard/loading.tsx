export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" />
        <div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" />
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
