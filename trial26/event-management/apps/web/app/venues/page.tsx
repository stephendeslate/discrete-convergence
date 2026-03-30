// TRACED:EM-FE-004
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { VenueList } from '../../components/venue-list';
import { CreateVenueForm } from '../../components/create-venue-form';

export default async function VenuesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let venues: Array<{ id: string; name: string; city: string; capacity: number }> = [];
  try {
    const res = await apiClient<{ data: typeof venues }>('/venues', { token });
    venues = res.data ?? [];
  } catch {
    venues = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Venues</h1>
      </div>
      <CreateVenueForm />
      <VenueList venues={venues} />
    </div>
  );
}
