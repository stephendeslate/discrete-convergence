import type { RouteRecord } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface RouteMapProps {
  route: RouteRecord;
}

export function RouteMap({ route }: RouteMapProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{route.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div className="h-12 w-0.5 bg-border" />
            <div className="h-3 w-3 rounded-full bg-red-500" />
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Origin</p>
              <p className="text-sm font-medium">{route.origin}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Destination</p>
              <p className="text-sm font-medium">{route.destination}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Distance</p>
            <p className="font-medium">{Number(route.distanceKm).toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Time</p>
            <p className="font-medium">{route.estimatedMinutes} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
