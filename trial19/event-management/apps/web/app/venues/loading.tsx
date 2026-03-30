export default function VenuesLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-4xl mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--muted)] rounded" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading venues...</span>
    </div>
  );
}
