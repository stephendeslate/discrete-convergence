import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

const mockWorkOrders = [
  { id: '1', title: 'HVAC Repair', status: 'UNASSIGNED', priority: 'HIGH', customer: 'Acme Corp' },
  { id: '2', title: 'Plumbing Inspection', status: 'ASSIGNED', priority: 'MEDIUM', customer: 'BuildRight LLC' },
  { id: '3', title: 'Electrical Maintenance', status: 'EN_ROUTE', priority: 'LOW', customer: 'TechStart Inc' },
];

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dispatch Board</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockWorkOrders.map((wo) => (
          <Card key={wo.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{wo.title}</CardTitle>
                <StatusBadge status={wo.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Customer</dt>
                  <dd>{wo.customer}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Priority</dt>
                  <dd>{wo.priority}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
