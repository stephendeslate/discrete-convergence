import { getDataSources } from '../../lib/actions';

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>
      <div className="border rounded-lg p-8 text-center text-gray-500">
        {dataSources && dataSources.data && dataSources.data.length > 0 ? (
          <pre className="text-left text-sm">{JSON.stringify(dataSources.data, null, 2)}</pre>
        ) : (
          <p>No data sources configured. Connect your first data source to get started.</p>
        )}
      </div>
    </div>
  );
}
