import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const mockCustomers = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0100', address: '123 Main St' },
  { id: '2', name: 'BuildRight LLC', email: 'info@buildright.com', phone: '555-0200', address: '456 Oak Ave' },
  { id: '3', name: 'TechStart Inc', email: 'hello@techstart.io', phone: '555-0300', address: '789 Pine Rd' },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
