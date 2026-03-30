import { getDashboards } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TRACED: AE-FE-014 — Dashboard list page with server-side data fetching
export default async function DashboardPage() {
  const { data, error } = await getDashboards();

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <p className="text-[var(--muted-foreground)]">
          Please <a href="/login" className="underline">sign in</a> to view dashboards.
        </p>
      </div>
    );
  }

  const dashboards = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <a href="/dashboard/new">
          <Button>Create Dashboard</Button>
        </a>
      </div>

      {dashboards.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No dashboards yet. Create your first one.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d: { id: string; name: string; description: string; status: string }) => (
            <Card key={d.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{d.name}</CardTitle>
                  <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {d.status}
                  </Badge>
                </div>
                <CardDescription>{d.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href={`/dashboard/${d.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
