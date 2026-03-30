// TRACED:AE-AX-001 — loading.tsx with role="status" + aria-busy="true"
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="h-64 animate-pulse rounded bg-[var(--muted)]" />
      <span className="sr-only">Loading dashboards...</span>
    </div>
  );
}
