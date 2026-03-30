// TRACED:EM-FE-010
'use client';

interface SessionItem {
  id: string;
  title: string;
  status: string;
  startTime: string;
}

export function SessionList({ sessions = [] }: { sessions?: SessionItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Sessions</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Start Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No sessions found.</td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id}>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">{session.title}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">{session.status}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">{session.startTime}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
