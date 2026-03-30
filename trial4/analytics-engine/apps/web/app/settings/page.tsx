export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="p-6 border border-[var(--border)] rounded-lg bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-4">Tenant Branding</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="tenantName" className="text-sm font-medium">Organization Name</label>
              <input
                id="tenantName"
                type="text"
                className="w-full mt-1 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input)]"
              />
            </div>
            <div>
              <label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</label>
              <input
                id="primaryColor"
                type="color"
                defaultValue="#3b82f6"
                className="mt-1 h-10 w-20"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border border-[var(--border)] rounded-lg bg-[var(--card)]">
          <h2 className="text-lg font-semibold mb-2">Subscription Tier</h2>
          <p className="text-[var(--muted-foreground)]">Current plan: PRO</p>
        </div>
      </div>
    </div>
  );
}
