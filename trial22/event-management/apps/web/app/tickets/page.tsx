import { getTickets } from '@/lib/actions';

export default async function TicketsPage() {
  const result = await getTickets();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Tickets</h1>
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((ticket: { id: string; status: string; price: string }) => (
              <tr key={ticket.id} className="border-b border-[var(--border)]">
                <td className="p-3">{ticket.id.slice(0, 8)}</td>
                <td className="p-3">{ticket.status}</td>
                <td className="p-3">${ticket.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
