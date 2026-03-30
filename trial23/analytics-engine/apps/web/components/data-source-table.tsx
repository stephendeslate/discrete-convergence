'use client';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DataSource {
  id: string;
  name: string;
  type?: string;
  status?: string;
}

export default function DataSourceTable({ dataSources }: { dataSources: DataSource[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataSources.map((ds) => (
          <TableRow key={ds.id}>
            <TableCell className="font-medium">{ds.name}</TableCell>
            <TableCell>{ds.type ?? 'Unknown'}</TableCell>
            <TableCell>
              <Badge variant={ds.status === 'active' ? 'default' : 'secondary'}>
                {ds.status ?? 'Inactive'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
