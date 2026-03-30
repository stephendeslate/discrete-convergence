import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Technicians</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">No technicians</p>
                <p className="text-sm text-gray-500">Add technicians to get started</p>
              </div>
              <Badge>Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
