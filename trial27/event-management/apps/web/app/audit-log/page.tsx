// TRACED: EM-FE-016 — Audit log page
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { fetchAuditLog } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function AuditLogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';
  const result = token ? await fetchAuditLog(token) : { success: false, data: undefined };
  const entries = result.success && result.data ? (result.data as Record<string, unknown>).data as Array<Record<string, unknown>> ?? [] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No audit log entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id as string}>
                    <TableCell>{entry.action as string}</TableCell>
                    <TableCell>{entry.entity as string}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.entityId as string}</TableCell>
                    <TableCell>{entry.userId as string ?? '-'}</TableCell>
                    <TableCell>{new Date(entry.createdAt as string).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
