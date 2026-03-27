// TRACED: FD-FE-007 — Maintenance page
'use client';

import { Nav } from '@/components/nav';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function MaintenancePage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Maintenance</h1>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-300">
              Select a vehicle from the Vehicles page to view its maintenance history.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No maintenance logs to display
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
