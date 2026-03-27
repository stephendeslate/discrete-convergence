// TRACED: FD-FE-003 — Dashboard overview page
'use client';

import { Nav } from '@/components/nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

interface DashboardStats {
  vehicles: number;
  drivers: number;
  pendingJobs: number;
  completedJobs: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        const headers = { Authorization: `Bearer ${token}` };

        const [vehiclesRes, driversRes, jobsRes] = await Promise.all([
          fetch(`${apiUrl}/vehicles?pageSize=1`, { headers }),
          fetch(`${apiUrl}/drivers?pageSize=1`, { headers }),
          fetch(`${apiUrl}/dispatch-jobs?pageSize=1`, { headers }),
        ]);

        const vehicles = await vehiclesRes.json();
        const drivers = await driversRes.json();
        const jobs = await jobsRes.json();

        setStats({
          vehicles: vehicles.meta?.total || 0,
          drivers: drivers.meta?.total || 0,
          pendingJobs: jobs.meta?.total || 0,
          completedJobs: 0,
        });
      } catch {
        // Stats load failed silently
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    { title: 'Total Vehicles', value: stats?.vehicles },
    { title: 'Active Drivers', value: stats?.drivers },
    { title: 'Pending Jobs', value: stats?.pendingJobs },
    { title: 'Completed Jobs', value: stats?.completedJobs },
  ];

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-300">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{card.value ?? 0}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
