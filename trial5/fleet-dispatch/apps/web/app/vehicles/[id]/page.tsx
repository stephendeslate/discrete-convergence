import { fetchVehicles } from '@/lib/actions';
import type { VehicleRecord } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { VehicleCard } from '@/components/vehicle-card';
import { Nav } from '@/components/nav';

async function fetchVehicle(id: string): Promise<VehicleRecord> {
  const API_URL = process.env['API_URL'] ?? 'http://localhost:3001';
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('fd-token')?.value;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/vehicles/${id}`, {
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load vehicle: ${res.status}`);
  }
  return res.json() as Promise<VehicleRecord>;
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  let vehicle: VehicleRecord | null = null;
  let error: string | null = null;
  try {
    vehicle = await fetchVehicle(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load vehicle';
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">Vehicle Detail</h1>
          <Card className="mt-6">
            <CardContent className="p-6">
              <p className="text-destructive">{error ?? 'Vehicle not found'}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{vehicle.licensePlate}</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Make</p>
                    <p className="font-medium">{vehicle.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <StatusBadge status={vehicle.status} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium">{Number(vehicle.mileage).toLocaleString()} km</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
