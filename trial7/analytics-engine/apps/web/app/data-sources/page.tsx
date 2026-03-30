import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DataSourceList = dynamic(() => import('@/components/data-source-list'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

export default function DataSourcesPage(): React.JSX.Element {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>
      <DataSourceList />
    </div>
  );
}
