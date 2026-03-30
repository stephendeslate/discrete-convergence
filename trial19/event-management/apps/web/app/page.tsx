export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Event Management Platform</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Organize events, manage venues, track attendees, and handle registrations
        all in one multi-tenant platform.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Events</h2>
          <p className="text-[var(--muted-foreground)]">Create and manage events with draft, published, and cancelled states.</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Venues</h2>
          <p className="text-[var(--muted-foreground)]">Track venue details including capacity and address.</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Attendees</h2>
          <p className="text-[var(--muted-foreground)]">Manage attendee profiles and contact information.</p>
        </div>
        <div className="border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Registrations</h2>
          <p className="text-[var(--muted-foreground)]">Handle event registrations with pending, confirmed, and cancelled tracking.</p>
        </div>
      </div>
    </div>
  );
}
