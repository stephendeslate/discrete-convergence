export default function DataSourcesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition">
          Add Data Source
        </button>
      </div>
      <div className="grid gap-4">
        <div className="p-6 border border-[var(--border)] rounded-lg bg-[var(--card)]">
          <p className="text-[var(--muted-foreground)]">
            No data sources configured. Click &quot;Add Data Source&quot; to connect your first data source.
          </p>
        </div>
      </div>
    </div>
  );
}
