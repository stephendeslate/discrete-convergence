import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function AuditPage() {
  const logs = [
    { id: '1', action: 'dashboard.created', actor: 'admin@acme.com', target: 'Sales Overview', timestamp: '2024-03-15T10:30:00Z' },
    { id: '2', action: 'data_source.updated', actor: 'admin@acme.com', target: 'Production DB', timestamp: '2024-03-15T09:15:00Z' },
    { id: '3', action: 'widget.deleted', actor: 'user@acme.com', target: 'Old Chart', timestamp: '2024-03-14T16:45:00Z' },
    { id: '4', action: 'user.login', actor: 'admin@acme.com', target: '-', timestamp: '2024-03-14T08:00:00Z' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Audit Log</h2>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="text-left p-4 text-sm font-medium">Action</th>
                <th className="text-left p-4 text-sm font-medium">Actor</th>
                <th className="text-left p-4 text-sm font-medium">Target</th>
                <th className="text-left p-4 text-sm font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b dark:border-gray-800 last:border-0">
                  <td className="p-4"><Badge>{log.action}</Badge></td>
                  <td className="p-4 text-sm">{log.actor}</td>
                  <td className="p-4 text-sm">{log.target}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
