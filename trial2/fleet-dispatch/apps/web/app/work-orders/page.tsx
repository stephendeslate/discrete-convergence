import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button>Create Work Order</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Fix leaky faucet</TableCell>
                <TableCell>John Smith</TableCell>
                <TableCell><Badge>ASSIGNED</Badge></TableCell>
                <TableCell><Badge variant="destructive">HIGH</Badge></TableCell>
                <TableCell>Bob Technician</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>HVAC inspection</TableCell>
                <TableCell>Sarah Johnson</TableCell>
                <TableCell><Badge variant="secondary">UNASSIGNED</Badge></TableCell>
                <TableCell><Badge variant="secondary">MEDIUM</Badge></TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
