import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RegistrationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registrations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Select an event to view its registrations.</p>
        </CardContent>
      </Card>
    </div>
  );
}
