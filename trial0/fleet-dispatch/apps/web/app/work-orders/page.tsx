import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';

const mockOrders = [
  { id: 'WO-001', title: 'HVAC Repair', status: 'COMPLETED', priority: 'HIGH', scheduledDate: '2024-03-15' },
  { id: 'WO-002', title: 'Plumbing Fix', status: 'IN_PROGRESS', priority: 'MEDIUM', scheduledDate: '2024-03-16' },
  { id: 'WO-003', title: 'Electrical Check', status: 'UNASSIGNED', priority: 'LOW', scheduledDate: '2024-03-17' },
];

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Work Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Scheduled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono">{order.id}</TableCell>
              <TableCell>{order.title}</TableCell>
              <TableCell><StatusBadge status={order.status} /></TableCell>
              <TableCell>{order.priority}</TableCell>
              <TableCell>{order.scheduledDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
