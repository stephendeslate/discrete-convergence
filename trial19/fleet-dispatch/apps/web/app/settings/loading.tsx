export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-7xl mx-auto py-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-28 mb-6" />
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
          <div className="border rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-28 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
