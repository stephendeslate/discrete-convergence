'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  technician?: { name: string };
  customer?: { name: string };
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setOrders([]);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button>New Work Order</Button>
      </div>
      {loading ? (
        <div role="status" aria-busy="true" className="animate-pulse text-muted-foreground">
          Loading work orders...
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Technician</th>
              <th className="px-4 py-2 text-left">Customer</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-2">{order.title}</td>
                <td className="px-4 py-2">
                  <Badge>{order.status}</Badge>
                </td>
                <td className="px-4 py-2">{order.priority}</td>
                <td className="px-4 py-2">{order.technician?.name ?? '—'}</td>
                <td className="px-4 py-2">{order.customer?.name ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
