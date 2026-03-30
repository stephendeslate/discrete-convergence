import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchDashboards } from '@/lib/actions';

export default async function DashboardPage() {
  const { data, error } = await fetchDashboards();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {error && (
        <div role="alert" className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Total Events', 'Total Venues', 'Total Attendees', 'Active Registrations'].map((title) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
