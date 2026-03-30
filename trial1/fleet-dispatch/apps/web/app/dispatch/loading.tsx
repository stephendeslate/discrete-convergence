export default function DispatchLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-96 animate-pulse rounded bg-muted" />
    </div>
  );
}
