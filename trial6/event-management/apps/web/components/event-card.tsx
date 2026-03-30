// TRACED:EM-FE-003 — Event card component for event listing pages
import { Card } from '@/components/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startDate: string;
  endDate: string;
  venue?: { name: string };
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  CANCELLED: 'danger',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function EventCard({ id, title, description, status, startDate, endDate, venue }: EventCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <a href={`/events/${id}`} className="block space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
          <Badge variant={statusVariant[status] ?? 'default'}>{status}</Badge>
        </div>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          {venue && <span>{venue.name}</span>}
        </div>
      </a>
    </Card>
  );
}
