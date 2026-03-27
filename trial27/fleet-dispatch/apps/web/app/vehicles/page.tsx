// TRACED: FD-FE-004 — Vehicles page with table listing
'use client';

import { Nav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { createVehicle } from '@/lib/actions';

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: string;
  status: string;
  mileage: number;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  AVAILABLE: 'default',
  IN_USE: 'secondary',
  MAINTENANCE: 'outline',
  RETIRED: 'destructive',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicles(data.data || []);
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAddVehicle() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const result = await createVehicle(token, {
      name: 'New Vehicle',
      licensePlate: `PLATE-${Date.now()}`,
    });
    if (result.success && result.data) {
      setVehicles((prev) => [result.data as unknown as Vehicle, ...prev]);
    }
  }

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vehicles</h1>
          <Button onClick={handleAddVehicle}>Add Vehicle</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mileage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">No vehicles found</TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell>{v.licensePlate}</TableCell>
                  <TableCell>{v.type}</TableCell>
                  <TableCell><Badge variant={statusVariant[v.status] || 'outline'}>{v.status}</Badge></TableCell>
                  <TableCell>{v.mileage.toLocaleString()} km</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
