'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchEvents } from '@/lib/actions';

interface Event {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((res) => setEvents(res.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (events.length === 0) {
    return <p className="text-gray-500">No events found. Create your first event to get started.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{event.name}</CardTitle>
              <Badge variant={event.status === 'PUBLISHED' ? 'success' : 'default'}>
                {event.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {new Date(event.startDate).toLocaleDateString()} –{' '}
              {new Date(event.endDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
