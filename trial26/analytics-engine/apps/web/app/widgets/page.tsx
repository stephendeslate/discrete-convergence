import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function WidgetsPage() {
  const widgets = [
    { id: '1', name: 'Revenue Chart', type: 'line_chart', dashboard: 'Sales Overview' },
    { id: '2', name: 'User Growth', type: 'bar_chart', dashboard: 'User Analytics' },
    { id: '3', name: 'CPU Usage', type: 'gauge', dashboard: 'System Metrics' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Widgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <CardTitle className="text-lg">{w.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge>{w.type}</Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">{w.dashboard}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
