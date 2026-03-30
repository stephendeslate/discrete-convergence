import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function EventsPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sample Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>Published</Badge>
            <p className="mt-2 text-[var(--muted-foreground)]">
              A sample event description.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
