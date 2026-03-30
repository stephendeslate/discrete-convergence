export default function DispatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatches</h1>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90">
          Create Dispatch
        </button>
      </div>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-left" role="table">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-sm font-medium">Reference</th>
              <th className="px-4 py-3 text-sm font-medium">Pickup</th>
              <th className="px-4 py-3 text-sm font-medium">Delivery</th>
              <th className="px-4 py-3 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-sm font-medium">Driver</th>
              <th className="px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]" colSpan={6}>
                No dispatches found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
