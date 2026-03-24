import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';

interface EventCardProps {
  title: string;
  status: string;
  date: string;
  venue?: string;
  registrations?: number;
}

export function EventCard({ title, status, date, venue, registrations }: EventCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge variant={status === 'PUBLISHED' ? 'default' : 'secondary'}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--muted-foreground)]">{date}</p>
        {venue && <p className="text-sm">{venue}</p>}
        {registrations !== undefined && (
          <p className="text-sm mt-1">{registrations} registrations</p>
        )}
      </CardContent>
    </Card>
  );
}
