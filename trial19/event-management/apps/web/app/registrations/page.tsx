import { getRegistrations } from '@/lib/actions';

export default async function RegistrationsPage() {
  const result = await getRegistrations();
  const registrations = result?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Registrations</h1>
      {registrations.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No registrations found.</p>
      ) : (
        <ul role="list" className="space-y-4">
          {registrations.map((reg: { id: string; status: string; eventId: string }) => (
            <li key={reg.id} className="border border-[var(--border)] rounded-lg p-4">
              <h2 className="text-lg font-semibold">Registration {reg.id}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Event: {reg.eventId} | Status: {reg.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
