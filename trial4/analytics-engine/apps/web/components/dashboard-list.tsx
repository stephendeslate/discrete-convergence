'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Dashboard {
  id: string;
  title: string;
  status: string;
  widgets: unknown[];
}

export default function DashboardList() {
  const dashboards: Dashboard[] = [];

  if (dashboards.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        No dashboards yet. Create your first dashboard to get started.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Card key={dashboard.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{dashboard.title}</CardTitle>
              <Badge variant={dashboard.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {dashboard.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              {dashboard.widgets.length} widget(s)
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
