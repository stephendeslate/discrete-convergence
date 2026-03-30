import { getDataSources } from '@/lib/actions';

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <main>
      <h1>Data Sources</h1>
      <section aria-label="Data source list">
        {dataSources.data.length === 0 ? (
          <p>No data sources configured.</p>
        ) : (
          <ul>
            {dataSources.data.map((ds: { id: string; name: string; type: string }) => (
              <li key={ds.id}>
                {ds.name} ({ds.type})
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
