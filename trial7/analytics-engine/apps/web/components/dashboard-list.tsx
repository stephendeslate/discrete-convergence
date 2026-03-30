'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TRACED:AE-FE-005
export default function DashboardList(): React.JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Sample Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>Active</Badge>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            A sample dashboard for demonstration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
