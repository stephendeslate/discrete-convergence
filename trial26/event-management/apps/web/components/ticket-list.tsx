// TRACED:EM-FE-010
'use client';

interface TicketItem {
  id: string;
  type: string;
  price: number;
  status: string;
}

export function TicketList({ tickets = [] }: { tickets?: TicketItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Tickets</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">{ticket.type}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">${ticket.price}</td>
                  <td className="px-6 py-4 text-sm dark:text-gray-300">{ticket.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
