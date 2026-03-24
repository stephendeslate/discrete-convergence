import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';

const mockTechnicians = [
  { id: '1', name: 'Mike Johnson', status: 'AVAILABLE', specialties: 'HVAC, Plumbing', activeOrders: 2 },
  { id: '2', name: 'Sarah Chen', status: 'BUSY', specialties: 'Electrical', activeOrders: 3 },
  { id: '3', name: 'Tom Davis', status: 'OFF_DUTY', specialties: 'General', activeOrders: 0 },
];

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Technicians</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead>Active Orders</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTechnicians.map((tech) => (
            <TableRow key={tech.id}>
              <TableCell className="font-medium">{tech.name}</TableCell>
              <TableCell><StatusBadge status={tech.status} /></TableCell>
              <TableCell>{tech.specialties}</TableCell>
              <TableCell>{tech.activeOrders}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
