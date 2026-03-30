'use client';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DataSourceList(): React.JSX.Element {
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
        <TableRow>
          <TableCell>Production DB</TableCell>
          <TableCell>PostgreSQL</TableCell>
          <TableCell><Badge>Connected</Badge></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
