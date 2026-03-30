export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Event Details</h1>
      <p className="text-[var(--muted-foreground)]">
        Viewing event: {id}
      </p>
    </div>
  );
}
