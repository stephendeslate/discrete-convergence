// TRACED: AE-FE-004 — Dashboard management pages
// TRACED: AE-FE-005 — Widget management pages

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createDashboardAction, publishDashboardAction, deleteDashboardAction } from '@/lib/actions';

interface Dashboard {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DashboardListPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token') ?? '';
    const result = await createDashboardAction(token, name, description);
    if (!result.error) {
      setDashboards([...dashboards, result]);
      setName('');
      setDescription('');
      setOpen(false);
    }
  }

  async function handlePublish(id: string) {
    const token = localStorage.getItem('token') ?? '';
    await publishDashboardAction(token, id);
  }

  async function handleDelete(id: string) {
    const token = localStorage.getItem('token') ?? '';
    await deleteDashboardAction(token, id);
    setDashboards(dashboards.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboards</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Dashboard</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Dashboard</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dash-name">Name</Label>
                <Input id="dash-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dash-desc">Description</Label>
                <Input id="dash-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No dashboards yet
                  </TableCell>
                </TableRow>
              ) : (
                dashboards.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handlePublish(d.id)}>
                        Publish
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
