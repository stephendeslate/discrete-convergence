export default function DriversLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-7xl mx-auto py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-28 mb-6" />
        <div className="border rounded-lg p-4 space-y-3">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading drivers...</span>
    </div>
  );
}
