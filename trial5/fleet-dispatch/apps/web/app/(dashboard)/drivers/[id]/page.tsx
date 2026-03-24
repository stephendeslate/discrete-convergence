import { fetchDriver } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  let driver;
  let error: string | null = null;
  try {
    driver = await fetchDriver(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load driver';
  }

  if (error || !driver) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Driver Detail</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error ?? 'Driver not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{driver.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Driver Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium">{driver.licenseNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{driver.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={driver.available ? 'success' : 'outline'}>
                {driver.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
