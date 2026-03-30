import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tickets</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No tickets yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
