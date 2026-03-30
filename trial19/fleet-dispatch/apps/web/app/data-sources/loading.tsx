export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-7xl mx-auto py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="border rounded-lg p-8">
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading data sources...</span>
    </div>
  );
}
