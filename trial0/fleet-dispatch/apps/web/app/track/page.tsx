'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

export default function TrackPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Track Your Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">
              Use the tracking link sent to your email to view your technician&apos;s location.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Live Tracking</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex h-96 items-center justify-center rounded-lg bg-[var(--muted)]">
              <p className="text-[var(--muted-foreground)]">Map loads here (Leaflet + OpenStreetMap)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-[var(--muted-foreground)]">Status</dt>
                <dd className="mt-1"><StatusBadge status="EN_ROUTE" /></dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Technician</dt>
                <dd>Loading...</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">ETA</dt>
                <dd>Calculating...</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
