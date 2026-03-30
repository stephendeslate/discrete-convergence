'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnicianPosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  activeOrders: number;
}

export default function DispatchDashboard() {
  const [technicians, setTechnicians] = useState<TechnicianPosition[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    unassigned: 0,
    completed: 0,
  });

  useEffect(() => {
    // Real-time data would be fetched here
    setTechnicians([]);
    setStats({ totalOrders: 0, inProgress: 0, unassigned: 0, completed: 0 });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unassigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex h-96 items-center justify-center rounded-lg bg-muted"
            aria-label="Dispatch map showing technician locations"
          >
            <p className="text-muted-foreground">
              Map integration requires Mapbox or Google Maps API key
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          {technicians.length === 0 ? (
            <p className="text-muted-foreground">No active technicians</p>
          ) : (
            <div className="space-y-2">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <span className="font-medium">{tech.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({tech.latitude.toFixed(4)}, {tech.longitude.toFixed(4)})
                    </span>
                  </div>
                  <Badge>{tech.activeOrders} active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
