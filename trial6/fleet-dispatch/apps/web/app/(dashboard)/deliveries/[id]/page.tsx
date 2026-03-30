import { fetchDelivery } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  let delivery;
  let error: string | null = null;
  try {
    delivery = await fetchDelivery(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load delivery';
  }

  if (error || !delivery) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Delivery Detail</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error ?? 'Delivery not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Delivery {delivery.trackingCode}</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={delivery.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recipient</p>
              <p className="font-medium">{delivery.recipientName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{delivery.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="font-medium">${Number(delivery.cost).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Driver</p>
              <p className="font-medium">
                {delivery.driver ? delivery.driver.name : 'Unassigned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {delivery.vehicle
                  ? `${delivery.vehicle.make} ${delivery.vehicle.model} (${delivery.vehicle.licensePlate})`
                  : 'Unassigned'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
