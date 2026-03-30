export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vehicles</h3>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Drivers</h3>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Trips</h3>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Dispatches</h3>
          <p className="text-2xl font-bold mt-1">--</p>
        </div>
      </div>
    </div>
  );
}
