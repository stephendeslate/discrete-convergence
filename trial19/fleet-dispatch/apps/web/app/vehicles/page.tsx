import { getVehicles } from '../../lib/actions';

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Plate</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Make</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Model</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Year</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles && vehicles.data && vehicles.data.length > 0 ? (
              vehicles.data.map((v: { id: string; plateNumber: string; make: string; model: string; year: number; status: string }) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{v.plateNumber}</td>
                  <td className="px-4 py-3 text-sm">{v.make}</td>
                  <td className="px-4 py-3 text-sm">{v.model}</td>
                  <td className="px-4 py-3 text-sm">{v.year}</td>
                  <td className="px-4 py-3 text-sm">{v.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No vehicles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
