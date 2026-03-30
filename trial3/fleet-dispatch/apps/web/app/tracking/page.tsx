import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Technician Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status</span>
              <Badge>EN ROUTE</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ETA</span>
              <span className="font-medium">Calculating...</span>
            </div>
            <div className="h-64 rounded-lg bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">Map will load here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
