import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';

const mockInvoices = [
  { id: 'INV-001', workOrder: 'WO-001', status: 'PAID', total: '$1,250.00', sentAt: '2024-03-10' },
  { id: 'INV-002', workOrder: 'WO-002', status: 'SENT', total: '$890.50', sentAt: '2024-03-14' },
  { id: 'INV-003', workOrder: 'WO-003', status: 'DRAFT', total: '$2,100.00', sentAt: '—' },
];

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Work Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockInvoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-mono">{inv.id}</TableCell>
              <TableCell className="font-mono">{inv.workOrder}</TableCell>
              <TableCell><StatusBadge status={inv.status} /></TableCell>
              <TableCell>{inv.total}</TableCell>
              <TableCell>{inv.sentAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
