import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

const mockRoutes = [
  { id: '1', technician: 'Mike Johnson', date: '2024-03-15', stops: 4, status: 'IN_PROGRESS' },
  { id: '2', technician: 'Sarah Chen', date: '2024-03-15', stops: 3, status: 'COMPLETED' },
  { id: '3', technician: 'Tom Davis', date: '2024-03-16', stops: 5, status: 'UNASSIGNED' },
];

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routes</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockRoutes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{route.technician}</CardTitle>
                <StatusBadge status={route.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Date</dt>
                  <dd>{route.date}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Stops</dt>
                  <dd>{route.stops}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
