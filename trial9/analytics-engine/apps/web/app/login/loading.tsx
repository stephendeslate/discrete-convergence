export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-48 rounded bg-[var(--muted)]" />
        <div className="h-10 w-72 rounded bg-[var(--muted)]" />
        <div className="h-10 w-72 rounded bg-[var(--muted)]" />
        <div className="h-10 w-72 rounded bg-[var(--muted)]" />
      </div>
    </div>
  );
}
