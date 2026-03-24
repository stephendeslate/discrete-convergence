import { getSession } from '@/lib/actions';
import { Navigation } from '@/components/navigation';

export default async function AttendeesPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <Navigation role={session?.role ?? 'VIEWER'} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Attendees</h1>
        <p className="text-gray-500">
          Select an event to view its attendees. Navigate to an event detail page to see
          the attendee list.
        </p>
      </main>
    </div>
  );
}
