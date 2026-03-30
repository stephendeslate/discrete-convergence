// TRACED:WEB-TICKET-LIST
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  type: string;
  price: number;
  quantity: number;
  sold: number;
  eventId: string;
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading tickets...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>;
  }

  if (tickets.length === 0) {
    return <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No tickets available.</p>;
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
      {tickets.map((t) => (
        <div key={t.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
          <h3 className={cn('font-semibold dark:text-white')}>{t.type}</h3>
          <p className={cn('text-lg font-bold text-blue-600 dark:text-blue-400')}>${t.price.toFixed(2)}</p>
          <p className={cn('text-sm text-gray-500 dark:text-gray-400')}>{t.sold}/{t.quantity} sold</p>
        </div>
      ))}
    </div>
  );
}
