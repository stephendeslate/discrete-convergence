import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function ApiKeysPage() {
  const keys = [
    { id: '1', name: 'Production Key', prefix: 'ak_prod_***', createdAt: '2024-01-15', status: 'active' },
    { id: '2', name: 'Staging Key', prefix: 'ak_stg_***', createdAt: '2024-02-20', status: 'active' },
    { id: '3', name: 'Old Key', prefix: 'ak_old_***', createdAt: '2023-06-10', status: 'revoked' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">API Keys</h2>
        <Button>Generate New Key</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="text-left p-4 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-sm font-medium">Key</th>
                <th className="text-left p-4 text-sm font-medium">Created</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-b dark:border-gray-800 last:border-0">
                  <td className="p-4 text-sm">{k.name}</td>
                  <td className="p-4 text-sm font-mono">{k.prefix}</td>
                  <td className="p-4 text-sm text-gray-500">{k.createdAt}</td>
                  <td className="p-4">
                    <Badge variant={k.status === 'active' ? 'success' : 'error'}>{k.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
