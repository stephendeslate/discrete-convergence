import type { VehicleRecord } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { StatusBadge } from './status-badge';

interface VehicleCardProps {
  vehicle: VehicleRecord;
}

export function VehicleCard({ vehicle }: VehicleCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{vehicle.licensePlate}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </span>
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="text-sm text-muted-foreground">
          Mileage: {Number(vehicle.mileage).toLocaleString()} km
        </div>
      </CardContent>
    </Card>
  );
}
