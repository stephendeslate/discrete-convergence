export default function VehiclesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Vehicle</button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3">VIN</th>
            <th className="text-left p-3">Make</th>
            <th className="text-left p-3">Model</th>
            <th className="text-left p-3">Year</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={5} className="p-3 text-center text-gray-500">No vehicles found</td></tr>
        </tbody>
      </table>
    </div>
  );
}
