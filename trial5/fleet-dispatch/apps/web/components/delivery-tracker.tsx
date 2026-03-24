import type { DeliveryRecord } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { StatusBadge } from './status-badge';

interface DeliveryTrackerProps {
  delivery: DeliveryRecord;
}

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'] as const;

function getStepIndex(status: string): number {
  if (status === 'FAILED') return -1;
  const idx = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]);
  return idx >= 0 ? idx : 0;
}

export function DeliveryTracker({ delivery }: DeliveryTrackerProps): React.JSX.Element {
  const currentStep = getStepIndex(delivery.status);
  const isFailed = delivery.status === 'FAILED';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tracking: {delivery.trackingCode}</CardTitle>
          <StatusBadge status={delivery.status} />
        </div>
      </CardHeader>
      <CardContent>
        {isFailed ? (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            This delivery has failed. Please contact dispatch for resolution.
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-xs text-muted-foreground">
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Recipient</p>
            <p className="font-medium">{delivery.recipientName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Address</p>
            <p className="font-medium">{delivery.address}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cost</p>
            <p className="font-medium">${Number(delivery.cost).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Driver</p>
            <p className="font-medium">
              {delivery.driver ? delivery.driver.name : 'Unassigned'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
