import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Route Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Select a technician and work orders to optimize routes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
