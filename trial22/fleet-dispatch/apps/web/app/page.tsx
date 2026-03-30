export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Fleet Dispatch</h1>
      <p className="text-lg mb-8">
        Multi-tenant fleet management and dispatch platform. Manage vehicles, drivers,
        routes, trips, and dispatches from a single dashboard.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/dashboard" className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
          <h2 className="font-semibold mb-2">Dashboard</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overview of fleet operations</p>
        </a>
        <a href="/vehicles" className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
          <h2 className="font-semibold mb-2">Vehicles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your fleet vehicles</p>
        </a>
        <a href="/dispatches" className="border rounded p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
          <h2 className="font-semibold mb-2">Dispatches</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track dispatch operations</p>
        </a>
      </div>
    </div>
  );
}
