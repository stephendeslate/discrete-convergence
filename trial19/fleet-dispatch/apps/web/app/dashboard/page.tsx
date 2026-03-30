import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED: FD-UI-003
export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg" role="region" aria-label="Vehicle summary">
          <h2 className="text-lg font-semibold mb-2">Vehicles</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500">Total active vehicles</p>
        </div>
        <div className="p-6 border rounded-lg" role="region" aria-label="Driver summary">
          <h2 className="text-lg font-semibold mb-2">Drivers</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500">Available drivers</p>
        </div>
        <div className="p-6 border rounded-lg" role="region" aria-label="Dispatch summary">
          <h2 className="text-lg font-semibold mb-2">Dispatches</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500">Pending dispatches</p>
        </div>
      </div>
      <p className="mt-8 text-sm text-gray-400">Version: {APP_VERSION}</p>
    </div>
  );
}
