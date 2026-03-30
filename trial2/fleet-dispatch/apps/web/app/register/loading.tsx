export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="space-y-4 w-full max-w-md">
        <div className="h-8 bg-[var(--muted)] rounded animate-pulse" />
        <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-3/4" />
        <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/2" />
        <span className="sr-only">Loading Register...</span>
      </div>
    </div>
  );
}
