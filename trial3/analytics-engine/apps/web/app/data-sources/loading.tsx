export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      <span className="sr-only">Loading data sources...</span>
    </div>
  );
}
