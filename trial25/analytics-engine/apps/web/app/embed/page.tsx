// TRACED:AE-WEB-EMBED-001 — Embed domain route page

export default function EmbedPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Embed Dashboards</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Generate embed codes to share your dashboards externally.
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Embed Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Dashboard</label>
            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
              <option>Select a dashboard...</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Embed Code</label>
            <textarea
              readOnly
              className="w-full p-2 border rounded font-mono text-sm dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              value={'<iframe src="https://analytics.example.com/embed/..." width="100%" height="600"></iframe>'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
