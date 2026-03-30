export default function SettingsLoading() {
  return (
    <div role="status" aria-busy="true" className="max-w-4xl mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6" />
        <div className="border border-[var(--border)] rounded-lg p-6">
          <div className="h-6 bg-[var(--muted)] rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-5 bg-[var(--muted)] rounded w-1/2" />
            <div className="h-5 bg-[var(--muted)] rounded w-1/3" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading settings...</span>
    </div>
  );
}
