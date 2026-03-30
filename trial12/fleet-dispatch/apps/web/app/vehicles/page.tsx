// TRACED: FD-UI-006
export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90">
          Add Vehicle
        </button>
      </div>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-left" role="table">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">License Plate</th>
              <th className="px-4 py-3 text-sm font-medium">Make</th>
              <th className="px-4 py-3 text-sm font-medium">Model</th>
              <th className="px-4 py-3 text-sm font-medium">Year</th>
              <th className="px-4 py-3 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]" colSpan={6}>
                No vehicles found. Add your first vehicle to get started.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
