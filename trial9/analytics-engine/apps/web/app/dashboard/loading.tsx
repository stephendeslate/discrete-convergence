export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 rounded bg-[var(--muted)] animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-32 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-32 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-32 rounded bg-[var(--muted)] animate-pulse" />
      </div>
    </div>
  );
}
