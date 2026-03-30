// TRACED:WEB-VENUES-PAGE
import { VenueList } from '@/components/venue-list';
import { CreateVenueForm } from '@/components/create-venue-form';

export default function VenuesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
      </div>
      <CreateVenueForm />
      <VenueList />
    </div>
  );
}
