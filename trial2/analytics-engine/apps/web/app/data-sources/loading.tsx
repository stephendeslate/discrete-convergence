export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
      <div className="h-64 animate-pulse rounded bg-[var(--muted)]" />
      <span className="sr-only">Loading data sources...</span>
    </div>
  );
}
