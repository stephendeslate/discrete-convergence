'use client';

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DispatchMap = dynamic(() => import('@/components/dispatch-map'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

/**
 * Dispatch dashboard page — split-view with map and work order list.
 * TRACED:FD-UI-004
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dispatch Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
          </CardHeader>
          <CardContent>
            <DispatchMap />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-md bg-[var(--muted)]">
                <span>Fix leaky faucet</span>
                <Badge>ASSIGNED</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-[var(--muted)]">
                <span>HVAC inspection</span>
                <Badge variant="secondary">UNASSIGNED</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-[var(--muted)]">
                <span>Electrical panel upgrade</span>
                <Badge variant="outline">COMPLETED</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
