import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

async function getNotifications(): Promise<Array<{
  id: string;
  subject: string;
  status: string;
  type: string;
  createdAt: string;
}>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/notifications`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to load notifications');
  }
  const body = await res.json();
  return body.data ?? [];
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'SENT': return 'default';
    case 'PENDING': return 'secondary';
    case 'FAILED': return 'destructive';
    default: return 'outline';
  }
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-[var(--muted-foreground)] py-8 text-center">No notifications sent yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.subject}</TableCell>
                    <TableCell>{n.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(n.status)}>{n.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
