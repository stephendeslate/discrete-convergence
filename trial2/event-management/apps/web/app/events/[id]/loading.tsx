export default function EventDetailsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-[var(--muted)]" />
      <div className="h-4 w-96 rounded bg-[var(--muted)]" />
      <div className="h-32 rounded bg-[var(--muted)]" />
    </div>
  );
}
