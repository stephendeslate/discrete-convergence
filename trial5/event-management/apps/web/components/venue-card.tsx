// TRACED:EM-FE-007 — Venue card for venue listing pages
import { Card } from '@/components/card';

interface VenueCardProps {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

export function VenueCard({ id, name, address, capacity }: VenueCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <a href={`/venues/${id}`} className="block space-y-2">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600">{address}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Capacity: {capacity.toLocaleString()}</span>
        </div>
      </a>
    </Card>
  );
}
