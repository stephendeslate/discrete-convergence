import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { fetchVehicles, fetchDrivers, fetchTrips } from '@/lib/actions';

const DashboardStats = dynamic(() => import('@/components/dashboard-stats'), { ssr: false });

export default async function DashboardPage() {
  const [vehicles, drivers, trips] = await Promise.all([
    fetchVehicles(),
    fetchDrivers(),
    fetchTrips(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{vehicles.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{drivers.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{trips.total}</p>
          </CardContent>
        </Card>
      </div>
      <DashboardStats />
    </div>
  );
}
