import { Card } from '../components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboards">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium">Dashboards</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage analytics dashboards</p>
          </Card>
        </Link>
        <Link href="/data-sources">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium">Data Sources</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure external data connections</p>
          </Card>
        </Link>
        <Link href="/widgets">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-medium">Widgets</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Build charts and visualizations</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
