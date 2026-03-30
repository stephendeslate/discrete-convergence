'use client';

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function EventList() {
  return (
    <div className="mt-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>No events yet</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Draft</Badge>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Create your first event to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
