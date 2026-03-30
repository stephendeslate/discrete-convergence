import { getDataSources } from '@/lib/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DataSourcesPage() {
  const data = await getDataSources();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Data Sources</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((ds) => (
            <TableRow key={ds.id}>
              <TableCell>{ds.name}</TableCell>
              <TableCell>{ds.type}</TableCell>
              <TableCell>
                <Badge variant={ds.isActive ? 'default' : 'destructive'}>
                  {ds.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="mt-4 text-sm text-gray-500">Total: {data.total} data sources</p>
    </div>
  );
}
