// TRACED:WEB-HOME
export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to Event Management</h1>
      <p className="text-gray-600 text-lg">
        Manage your events, venues, sessions, speakers, tickets, and attendees
        all in one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/events"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Events</h2>
          <p className="text-gray-600">Create and manage your events</p>
        </a>
        <a
          href="/venues"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Venues</h2>
          <p className="text-gray-600">Manage event venues and locations</p>
        </a>
        <a
          href="/settings"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-gray-600">Configure your account</p>
        </a>
      </div>
    </div>
  );
}
