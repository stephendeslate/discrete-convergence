export const dynamic = 'force-dynamic';

import { fetchMyRegistrations } from '@/lib/actions';

/** TRACED:EM-FE-014 — My registrations page */
export default async function MyRegistrationsPage() {
  const { data: registrations } = await fetchMyRegistrations();

  return (
    <section>
      <h1>My Registrations</h1>
      <h2>Your Event Registrations</h2>
      {registrations.length === 0 ? (
        <p>You have no registrations yet.</p>
      ) : (
        <ul>
          {registrations.map((reg) => (
            <li key={String(reg['id'])}>
              <span>{String(reg['status'])}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
