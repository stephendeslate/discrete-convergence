export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading registration...</div>
    </div>
  );
}
