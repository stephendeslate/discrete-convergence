import { getDashboards } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED: AE-UI-006
export default async function DashboardPage() {
  const result = await getDashboards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboards</h1>
      </div>
      {result.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Dashboards</CardTitle>
            <CardDescription>Create your first dashboard to get started.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Widgets</TableHead>
              <TableHead>Visibility</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((dashboard: { id: string; name: string; description?: string; widgets: unknown[]; isPublic: boolean }) => (
              <TableRow key={dashboard.id}>
                <TableCell className="font-medium">{dashboard.name}</TableCell>
                <TableCell>{dashboard.description ?? '-'}</TableCell>
                <TableCell>{dashboard.widgets.length}</TableCell>
                <TableCell>
                  <Badge variant={dashboard.isPublic ? 'default' : 'secondary'}>
                    {dashboard.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-sm text-[var(--muted-foreground)]">
        Total: {result.total} dashboards
      </p>
    </div>
  );
}
