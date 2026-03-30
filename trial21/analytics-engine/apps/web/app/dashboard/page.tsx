import Link from 'next/link';
import { getDashboards } from '@/lib/actions';

// TRACED: AE-A11Y-005 — dashboard list page with heading hierarchy
// TRACED: AE-FI-005 — empty state for dashboard list
export default async function DashboardListPage() {
  const { data: dashboards } = await getDashboards();
  const items = (dashboards ?? []) as Array<{ id: string; title: string; status: string }>;

  return (
    <main>
      <h1>Dashboards</h1>
      <nav aria-label="Dashboard navigation">
        <Link href="/dashboard/new">Create Dashboard</Link>
      </nav>
      <section aria-label="Dashboard list">
        {items.length === 0 ? (
          <p>No dashboards found. Create your first dashboard.</p>
        ) : (
          <ul>
            {items.map((d) => (
              <li key={d.id}>
                <Link href={`/dashboard/${d.id}`}>
                  <h2>{d.title}</h2>
                  <span>Status: {d.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
