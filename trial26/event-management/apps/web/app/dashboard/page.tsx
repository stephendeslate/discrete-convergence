// TRACED:EM-FE-005
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</h3>
          <p className="mt-2 text-3xl font-bold dark:text-white">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Venues</h3>
          <p className="mt-2 text-3xl font-bold dark:text-white">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tickets Sold</h3>
          <p className="mt-2 text-3xl font-bold dark:text-white">0</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendees</h3>
          <p className="mt-2 text-3xl font-bold dark:text-white">0</p>
        </div>
      </div>
    </div>
  );
}
