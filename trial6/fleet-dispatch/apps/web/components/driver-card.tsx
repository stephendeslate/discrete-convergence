import type { DriverRecord } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface DriverCardProps {
  driver: DriverRecord;
}

export function DriverCard({ driver }: DriverCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{driver.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{driver.phone}</span>
          <Badge variant={driver.available ? 'success' : 'outline'}>
            {driver.available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          License: {driver.licenseNumber}
        </div>
      </CardContent>
    </Card>
  );
}
