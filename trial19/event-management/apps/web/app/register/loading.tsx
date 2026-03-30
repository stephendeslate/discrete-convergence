export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-md mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-[var(--muted)] rounded" />
          <div className="h-10 bg-[var(--muted)] rounded" />
          <div className="h-10 bg-[var(--muted)] rounded" />
          <div className="h-10 bg-[var(--muted)] rounded" />
        </div>
      </div>
      <span className="sr-only">Loading registration form...</span>
    </div>
  );
}
