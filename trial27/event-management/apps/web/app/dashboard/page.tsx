// TRACED: EM-FE-012 — Dashboard overview page
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchEvents, fetchVenues } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? '';

  const [eventsResult, venuesResult] = token
    ? await Promise.all([fetchEvents(token), fetchVenues(token)])
    : [{ success: false, data: undefined }, { success: false, data: undefined }];

  const eventsData = eventsResult.success && eventsResult.data ? eventsResult.data as Record<string, unknown> : undefined;
  const venuesData = venuesResult.success && venuesResult.data ? venuesResult.data as Record<string, unknown> : undefined;

  const totalEvents = (eventsData?.total as number) ?? 0;
  const totalVenues = (venuesData?.total as number) ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">Events created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently published</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVenues}</div>
            <p className="text-xs text-muted-foreground">Venues available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total registrations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
