import { getDataSources } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default async function DataSourcesPage() {
  const result = await getDataSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Sources</h1>
      </div>
      {result.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Data Sources</CardTitle>
            <CardDescription>Connect your first data source to start building dashboards.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Refresh Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((ds: { id: string; name: string; type: string; status: string; refreshRate: number }) => (
              <TableRow key={ds.id}>
                <TableCell className="font-medium">{ds.name}</TableCell>
                <TableCell>{ds.type}</TableCell>
                <TableCell>
                  <Badge variant={ds.status === 'ACTIVE' ? 'default' : ds.status === 'ERROR' ? 'destructive' : 'secondary'}>
                    {ds.status}
                  </Badge>
                </TableCell>
                <TableCell>{ds.refreshRate}s</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-sm text-[var(--muted-foreground)]">
        Total: {result.total} data sources
      </p>
    </div>
  );
}
