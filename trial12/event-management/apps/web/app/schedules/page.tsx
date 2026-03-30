import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedules</h1>
      <Card>
        <CardHeader>
          <CardTitle>Event Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No schedules yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
