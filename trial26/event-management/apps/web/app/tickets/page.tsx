// TRACED:EM-FE-005
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { TicketList } from '../../components/ticket-list';

export default async function TicketsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let tickets: Array<{ id: string; type: string; price: number; status: string }> = [];
  try {
    const res = await apiClient<{ data: typeof tickets }>('/tickets', { token });
    tickets = res.data ?? [];
  } catch {
    tickets = [];
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Tickets</h1>
      <TicketList tickets={tickets} />
    </div>
  );
}
