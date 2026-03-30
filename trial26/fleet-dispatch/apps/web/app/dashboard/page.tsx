// TRACED:FD-WEB-015 — Dashboard page
import NavBar from '@/components/nav-bar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Active Vehicles</h2>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Available Drivers</h2>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Active Dispatches</h2>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Routes</h2>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
        </div>
      </main>
    </div>
  );
}
