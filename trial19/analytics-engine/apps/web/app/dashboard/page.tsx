import { getDashboards } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

// TRACED: AE-FE-007
export default async function DashboardListPage() {
  const dashboards = await getDashboards();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboards</h1>
      </div>
      <Separator />
      {dashboards.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No dashboards yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Dashboard list">
          {dashboards.map((d: { id: string; name: string; status: string; description?: string }) => (
            <Link key={d.id} href={`/dashboard/${d.id}`} role="listitem">
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{d.name}</CardTitle>
                  <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'}>{d.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[var(--muted-foreground)]">{d.description ?? 'No description'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
