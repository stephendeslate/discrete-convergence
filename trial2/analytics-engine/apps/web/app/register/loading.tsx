export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-10 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-10 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-10 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-10 animate-pulse rounded bg-[var(--muted)]" />
      </div>
      <span className="sr-only">Loading registration form...</span>
    </div>
  );
}
