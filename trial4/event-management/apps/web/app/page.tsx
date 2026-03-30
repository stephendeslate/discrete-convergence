export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Event Management Platform</h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        Create, schedule, and manage events with attendee registration, ticketing, and check-in.
      </p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Demo application — no real transactions processed.
      </p>
    </div>
  );
}
