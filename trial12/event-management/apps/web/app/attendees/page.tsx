import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AttendeesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendees</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No attendees yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
