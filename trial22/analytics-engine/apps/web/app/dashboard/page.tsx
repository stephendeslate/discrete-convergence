import { getDashboards } from '@/lib/actions';

// TRACED: AE-FE-004
export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <main>
      <h1>Dashboards</h1>
      <section aria-label="Dashboard list">
        {dashboards.data.length === 0 ? (
          <p>No dashboards found. Create one to get started.</p>
        ) : (
          <ul>
            {dashboards.data.map((d: { id: string; title: string }) => (
              <li key={d.id}>
                <a href={`/dashboard/${d.id}`}>{d.title}</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
