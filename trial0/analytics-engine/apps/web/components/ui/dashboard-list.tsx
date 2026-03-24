'use client';

import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';

export default function DashboardList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sales Overview</CardTitle>
            <Badge>Published</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Real-time sales metrics and KPIs
          </p>
          <p className="text-sm mt-2">2 widgets</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Draft Dashboard</CardTitle>
            <Badge variant="secondary">Draft</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Work in progress
          </p>
          <p className="text-sm mt-2">0 widgets</p>
        </CardContent>
      </Card>
    </div>
  );
}
