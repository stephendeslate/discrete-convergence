'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function DashboardContent() {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-[var(--muted-foreground)]">Active events</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-[var(--muted-foreground)]">Total registrations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-[var(--muted-foreground)]">Today</p>
        </CardContent>
      </Card>
    </div>
  );
}
