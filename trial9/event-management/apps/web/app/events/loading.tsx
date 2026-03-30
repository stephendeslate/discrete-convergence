export default function EventsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-[var(--muted)]" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-[var(--muted)]" />
      ))}
      <span className="sr-only">Loading events...</span>
    </div>
  );
}
