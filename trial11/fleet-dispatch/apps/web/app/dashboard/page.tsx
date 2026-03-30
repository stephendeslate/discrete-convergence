// TRACED: FD-UI-004
import { getVehicles, getDrivers, getDispatches } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function DashboardPage() {
  let vehicleCount = 0;
  let driverCount = 0;
  let dispatchCount = 0;

  try {
    const [vehicles, drivers, dispatches] = await Promise.all([
      getVehicles(),
      getDrivers(),
      getDispatches(),
    ]);
    vehicleCount = Array.isArray(vehicles) ? vehicles.length : 0;
    driverCount = Array.isArray(drivers) ? drivers.length : 0;
    dispatchCount = Array.isArray(dispatches) ? dispatches.length : 0;
  } catch {
    // Data will show as 0
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{vehicleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{driverCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dispatches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{dispatchCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
