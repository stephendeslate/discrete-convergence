export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-7xl mx-auto py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading dashboard data...</span>
    </div>
  );
}
