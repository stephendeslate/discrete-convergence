import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button>Create Event</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
              <div>
                <h3 className="font-semibold">Tech Conference 2026</h3>
                <p className="text-sm text-[var(--muted-foreground)]">June 15-17, 2026</p>
              </div>
              <Badge>Registration Open</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
              <div>
                <h3 className="font-semibold">Startup Meetup</h3>
                <p className="text-sm text-[var(--muted-foreground)]">April 20, 2026</p>
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
