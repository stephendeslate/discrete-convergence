export default async function DataSourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <h1>Data Source Configuration</h1>
      <p>Configure data source: {id}</p>
      <section aria-label="Data source settings">
        <h2>Connection Settings</h2>
        <p>Connection details will be shown here.</p>
        <h2>Field Mappings</h2>
        <p>Field mapping configuration will be shown here.</p>
      </section>
    </main>
  );
}
