import { getDashboard } from '@/lib/actions';
import { AppHeader } from '@/components/app-header';
import { WidgetRenderer } from '@/components/widget-renderer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardDetailProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardDetailPage({
  params,
}: DashboardDetailProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  const statusColor = {
    DRAFT: 'secondary' as const,
    PUBLISHED: 'default' as const,
    ARCHIVED: 'outline' as const,
  };

  return (
    <>
      <AppHeader />
      <main className="flex-1 container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{dashboard.title}</h1>
            <Badge variant={statusColor[dashboard.status as keyof typeof statusColor] ?? 'secondary'}>
              {dashboard.status}
            </Badge>
          </div>
          {dashboard.description && (
            <p className="text-muted-foreground mt-2">{dashboard.description}</p>
          )}
        </div>

        {dashboard.widgets.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Add widgets to this dashboard to visualize your data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.widgets.map((widget) => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
