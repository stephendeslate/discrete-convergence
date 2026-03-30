import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const VenueList = dynamic(() => import('@/components/venue-list'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Venues</h1>
      <VenueList />
    </div>
  );
}
