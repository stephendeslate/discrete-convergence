export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-[var(--muted)] rounded w-40" />
          <div className="h-10 bg-[var(--muted)] rounded w-44" />
        </div>
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="h-20 bg-[var(--muted)] rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading data sources...</span>
    </div>
  );
}
