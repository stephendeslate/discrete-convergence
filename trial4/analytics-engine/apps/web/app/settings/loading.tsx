export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[var(--muted)] rounded w-32" />
        <div className="h-48 bg-[var(--muted)] rounded-lg" />
        <div className="h-24 bg-[var(--muted)] rounded-lg" />
      </div>
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
