// TRACED: FD-FE-003 — Loading states with role="status" and aria-busy
export default function WorkOrdersLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading work orders...</span>
    </div>
  );
}
