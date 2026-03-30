import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function TicketsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Tickets</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>No tickets yet</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">None</Badge>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Purchase tickets to upcoming events.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
