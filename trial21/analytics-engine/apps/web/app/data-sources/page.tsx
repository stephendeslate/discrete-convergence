import { getDataSources } from '@/lib/actions';
import Link from 'next/link';

export default async function DataSourcesPage() {
  const { data: sources } = await getDataSources();

  return (
    <main>
      <h1>Data Sources</h1>
      <nav aria-label="Data source actions">
        <Link href="/data-sources/new">Add Data Source</Link>
      </nav>
      <section aria-label="Data source list">
        {(sources as Array<{ id: string; name: string; type: string }>).length === 0 ? (
          <p>No data sources configured.</p>
        ) : (
          <ul>
            {(sources as Array<{ id: string; name: string; type: string }>).map((ds) => (
              <li key={ds.id}>
                <Link href={`/data-sources/${ds.id}`}>
                  <h2>{ds.name}</h2>
                  <span>Type: {ds.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
