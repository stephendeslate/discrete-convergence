// TRACED:FD-WEB-022 — Zones domain page
import NavBar from '@/components/nav-bar';

export default function ZonesPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Zones</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Zone management with boundary definitions</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Zone List</h3>
              <p className="text-sm text-gray-500 mt-1">No zones configured</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Zone Map</h3>
              <p className="text-sm text-gray-500 mt-1">Map view coming soon</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
