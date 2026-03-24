import { getDataSources } from '@/lib/actions';
import { AppHeader } from '@/components/app-header';
import { DataSourceForm } from '@/components/data-source-form';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function DataSourcesPage(): Promise<React.JSX.Element> {
  const response = await getDataSources();

  return (
    <>
      <AppHeader />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Data Sources</h1>
            <p className="text-muted-foreground mt-1">
              Manage your external data connections
            </p>
          </div>
          <DataSourceForm />
        </div>

        {response.data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No data sources configured. Add one to start ingesting data.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {response.data.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell className="font-medium">{ds.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ds.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </>
  );
}
