export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-md mx-auto mt-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-[var(--muted)] rounded w-40" />
        <div className="h-10 bg-[var(--muted)] rounded" />
        <div className="h-10 bg-[var(--muted)] rounded" />
        <div className="h-10 bg-[var(--muted)] rounded" />
        <div className="h-12 bg-[var(--muted)] rounded" />
      </div>
      <span className="sr-only">Loading registration page...</span>
    </div>
  );
}
