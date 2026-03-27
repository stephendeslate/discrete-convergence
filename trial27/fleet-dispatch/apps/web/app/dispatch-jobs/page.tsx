// TRACED: FD-FE-006 — Dispatch jobs page
'use client';

import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { cancelDispatchJob, deleteDispatchJob } from '@/lib/actions';

interface DispatchJob {
  id: string;
  origin: string;
  destination: string;
  status: string;
  vehicle?: { name: string } | null;
  driver?: { name: string } | null;
  scheduledAt: string | null;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
};

export default function DispatchJobsPage() {
  const [jobs, setJobs] = useState<DispatchJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/dispatch-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobs(data.data || []);
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleCancelJob(jobId: string) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await cancelDispatchJob(token, jobId);
    if (result.success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'CANCELLED' } : j)),
      );
    }
  }

  async function handleDeleteJob(jobId: string) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await deleteDispatchJob(token, jobId);
    if (result.success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dispatch Jobs</h1>
          <Button>Create Job</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : jobs.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No dispatch jobs found</TableCell></TableRow>
            ) : (
              jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell>{j.origin}</TableCell>
                  <TableCell>{j.destination}</TableCell>
                  <TableCell><Badge variant={statusVariant[j.status] || 'outline'}>{j.status}</Badge></TableCell>
                  <TableCell>{j.vehicle?.name || '-'}</TableCell>
                  <TableCell>{j.driver?.name || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
