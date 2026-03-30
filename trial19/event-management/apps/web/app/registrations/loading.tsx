export default function RegistrationsLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-4xl mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--muted)] rounded" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading registrations...</span>
    </div>
  );
}
