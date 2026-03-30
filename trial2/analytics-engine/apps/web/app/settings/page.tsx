export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Organization</h2>
        <div>
          <label htmlFor="orgName" className="block text-sm font-medium mb-1">Organization Name</label>
          <input id="orgName" type="text" className="w-full max-w-md rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="tier" className="block text-sm font-medium mb-1">Current Tier</label>
          <input id="tier" type="text" disabled value="PRO" className="w-full max-w-md rounded-md border border-[var(--input)] bg-[var(--muted)] px-3 py-2 text-sm" />
        </div>
      </div>
    </div>
  );
}
