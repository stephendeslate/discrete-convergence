import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button>Create Work Order</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Sample Work Order</p>
                <p className="text-sm text-gray-500">No work orders available</p>
              </div>
              <Badge variant="secondary">UNASSIGNED</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
