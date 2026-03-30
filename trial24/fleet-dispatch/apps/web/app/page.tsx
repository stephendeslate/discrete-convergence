// TRACED:WEB-HOME-PAGE
export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Fleet Dispatch Dashboard</h1>
      <p className="text-gray-600">
        Manage your fleet vehicles, drivers, routes, and dispatches from one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/vehicles"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-800">Vehicles</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your fleet vehicles</p>
        </a>
        <a
          href="/drivers"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-800">Drivers</h2>
          <p className="text-sm text-gray-500 mt-1">Manage fleet drivers</p>
        </a>
        <a
          href="/dispatches"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-800">Dispatches</h2>
          <p className="text-sm text-gray-500 mt-1">View and create dispatches</p>
        </a>
      </div>
    </div>
  );
}
