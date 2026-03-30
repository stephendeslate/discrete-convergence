export default function ApiKeysLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-[var(--muted)] rounded w-32" />
          <div className="h-10 bg-[var(--muted)] rounded w-44" />
        </div>
        <div className="h-64 bg-[var(--muted)] rounded-lg" />
      </div>
      <span className="sr-only">Loading API keys...</span>
    </div>
  );
}
