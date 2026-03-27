// TRACED: FD-FE-005 — Drivers page with table listing
'use client';

import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { updateDriver } from '@/lib/actions';

interface Driver {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  status: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/drivers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDrivers(data.data || []);
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleToggleStatus(driver: Driver) {
    const token = localStorage.getItem('token');
    if (!token) return;
    const newStatus = driver.status === 'AVAILABLE' ? 'OFF_DUTY' : 'AVAILABLE';
    const result = await updateDriver(token, driver.id, { status: newStatus });
    if (result.success) {
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, status: newStatus } : d)),
      );
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Drivers</h1>
          <Button>Add Driver</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : drivers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">No drivers found</TableCell></TableRow>
            ) : (
              drivers.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>{d.email}</TableCell>
                  <TableCell>{d.licenseNumber}</TableCell>
                  <TableCell><Badge variant={d.status === 'AVAILABLE' ? 'default' : 'secondary'}>{d.status}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
