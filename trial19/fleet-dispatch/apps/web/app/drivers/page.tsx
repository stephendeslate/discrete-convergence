import { getDrivers } from '../../lib/actions';

export default async function DriversPage() {
  const drivers = await getDrivers();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Drivers</h1>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">License Number</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-semibold" scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers && drivers.data && drivers.data.length > 0 ? (
              drivers.data.map((d: { id: string; name: string; licenseNumber: string; phone: string; status: string }) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{d.name}</td>
                  <td className="px-4 py-3 text-sm">{d.licenseNumber}</td>
                  <td className="px-4 py-3 text-sm">{d.phone}</td>
                  <td className="px-4 py-3 text-sm">{d.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No drivers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
