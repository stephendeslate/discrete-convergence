export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-32 animate-pulse rounded bg-[var(--muted)]" />
      <div className="h-48 animate-pulse rounded bg-[var(--muted)]" />
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
