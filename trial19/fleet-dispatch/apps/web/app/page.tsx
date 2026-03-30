import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Fleet Dispatch Management</h1>
      <p className="text-lg mb-8">
        Multi-tenant fleet and vehicle dispatch management system. Manage your
        vehicles, drivers, routes, and dispatches from a single dashboard.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard"
          className="block p-6 border rounded-lg hover:border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p>View fleet overview and key metrics</p>
        </Link>
        <Link
          href="/vehicles"
          className="block p-6 border rounded-lg hover:border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">Vehicles</h2>
          <p>Manage your fleet of vehicles</p>
        </Link>
        <Link
          href="/drivers"
          className="block p-6 border rounded-lg hover:border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">Drivers</h2>
          <p>Track driver assignments and availability</p>
        </Link>
        <Link
          href="/dispatches"
          className="block p-6 border rounded-lg hover:border-blue-500"
        >
          <h2 className="text-xl font-semibold mb-2">Dispatches</h2>
          <p>Schedule and monitor dispatch operations</p>
        </Link>
      </div>
    </div>
  );
}
