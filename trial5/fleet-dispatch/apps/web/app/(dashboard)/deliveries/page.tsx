import Link from 'next/link';
import { fetchDeliveries } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';

export default async function DeliveriesPage(): Promise<React.JSX.Element> {
  let deliveries;
  let error: string | null = null;
  try {
    deliveries = await fetchDeliveries();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load deliveries';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Deliveries</h1>
      {error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Deliveries ({deliveries?.meta.total ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries?.data.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/deliveries/${d.id}`} className="font-medium underline">
                        {d.trackingCode}
                      </Link>
                    </TableCell>
                    <TableCell>{d.recipientName}</TableCell>
                    <TableCell className="max-w-xs truncate">{d.address}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell>${Number(d.cost).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {deliveries?.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No deliveries found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
