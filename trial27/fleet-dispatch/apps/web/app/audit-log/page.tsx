// TRACED: FD-FE-008 — Audit log page
'use client';

import { Nav } from '@/components/nav';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useState, useEffect } from 'react';

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { window.location.href = '/login'; return; }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/audit-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setEntries(data.data || []);
      } catch { /* empty */ }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Audit Log</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
            ) : entries.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-gray-500">No audit entries found</TableCell></TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.action}</TableCell>
                  <TableCell>{e.entity}</TableCell>
                  <TableCell className="font-mono text-xs">{e.entityId}</TableCell>
                  <TableCell>{new Date(e.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}
