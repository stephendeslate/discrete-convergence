import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function SyncRunsPage() {
  const runs = [
    { id: '1', dataSource: 'Production DB', status: 'success', recordsSync: 1250, duration: '3.2s', timestamp: '2024-03-15T10:00:00Z' },
    { id: '2', dataSource: 'Warehouse', status: 'success', recordsSync: 8400, duration: '12.1s', timestamp: '2024-03-15T09:00:00Z' },
    { id: '3', dataSource: 'Legacy API', status: 'failed', recordsSync: 0, duration: '30.0s', timestamp: '2024-03-15T08:00:00Z' },
    { id: '4', dataSource: 'Production DB', status: 'success', recordsSync: 1180, duration: '2.9s', timestamp: '2024-03-14T22:00:00Z' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Sync Runs</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="text-left p-4 text-sm font-medium">Data Source</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-left p-4 text-sm font-medium">Records</th>
                <th className="text-left p-4 text-sm font-medium">Duration</th>
                <th className="text-left p-4 text-sm font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b dark:border-gray-800 last:border-0">
                  <td className="p-4 text-sm">{run.dataSource}</td>
                  <td className="p-4">
                    <Badge variant={run.status === 'success' ? 'success' : 'error'}>{run.status}</Badge>
                  </td>
                  <td className="p-4 text-sm">{run.recordsSync.toLocaleString()}</td>
                  <td className="p-4 text-sm">{run.duration}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(run.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
