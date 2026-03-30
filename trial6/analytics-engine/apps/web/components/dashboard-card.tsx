import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface DashboardData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface DashboardCardProps {
  dashboard: DashboardData;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  PUBLISHED: 'default',
  DRAFT: 'secondary',
  ARCHIVED: 'outline',
};

export function DashboardCard({ dashboard }: DashboardCardProps): React.JSX.Element {
  return (
    <Link href={`/dashboard/${dashboard.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{dashboard.title}</CardTitle>
            <Badge variant={statusVariant[dashboard.status] ?? 'secondary'}>
              {dashboard.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {dashboard.description ?? 'No description'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Created {new Date(dashboard.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
