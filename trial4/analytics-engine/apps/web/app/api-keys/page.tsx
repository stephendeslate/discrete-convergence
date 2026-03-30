export default function ApiKeysPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <button className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition">
          Generate API Key
        </button>
      </div>
      <div className="border border-[var(--border)] rounded-lg bg-[var(--card)] overflow-hidden">
        <table className="w-full" role="table">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th scope="col" className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th scope="col" className="text-left px-4 py-3 text-sm font-medium">Prefix</th>
              <th scope="col" className="text-left px-4 py-3 text-sm font-medium">Type</th>
              <th scope="col" className="text-left px-4 py-3 text-sm font-medium">Created</th>
              <th scope="col" className="text-left px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted-foreground)]">
                No API keys yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
