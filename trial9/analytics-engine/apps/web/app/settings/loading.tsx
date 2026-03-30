export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 rounded bg-[var(--muted)] animate-pulse" />
      <div className="h-24 rounded bg-[var(--muted)] animate-pulse" />
      <div className="h-24 rounded bg-[var(--muted)] animate-pulse" />
    </div>
  );
}
