export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Event Management Platform</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Manage your events, venues, tickets, and attendees in one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/events" className="p-6 border border-[var(--border)] rounded-lg hover:border-[var(--primary)]">
          <h2 className="text-xl font-semibold mb-2">Events</h2>
          <p className="text-[var(--muted-foreground)]">Create and manage events</p>
        </a>
        <a href="/venues" className="p-6 border border-[var(--border)] rounded-lg hover:border-[var(--primary)]">
          <h2 className="text-xl font-semibold mb-2">Venues</h2>
          <p className="text-[var(--muted-foreground)]">Manage venue locations</p>
        </a>
        <a href="/attendees" className="p-6 border border-[var(--border)] rounded-lg hover:border-[var(--primary)]">
          <h2 className="text-xl font-semibold mb-2">Attendees</h2>
          <p className="text-[var(--muted-foreground)]">Track event attendees</p>
        </a>
      </div>
    </div>
  );
}
