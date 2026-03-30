export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-md mx-auto py-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-24 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading login form...</span>
    </div>
  );
}
