// TRACED: AE-FE-006 — Data source management pages

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createDataSourceAction, syncDataSourceAction } from '@/lib/actions';

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('POSTGRESQL');
  const [host, setHost] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token') ?? '';
    const result = await createDataSourceAction(token, name, type, { host });
    if (!result.error) {
      setSources([...sources, result]);
      setName('');
      setHost('');
    }
  }

  async function handleSync(id: string) {
    const token = localStorage.getItem('token') ?? '';
    await syncDataSourceAction(token, id);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Sources</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Data Source</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="ds-name">Name</Label>
              <Input id="ds-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="ds-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
                  <SelectItem value="MYSQL">MySQL</SelectItem>
                  <SelectItem value="REST_API">REST API</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-host">Host</Label>
              <Input id="ds-host" value={host} onChange={(e) => setHost(e.target.value)} required />
            </div>
            <div className="flex items-end">
              <Button type="submit">Add Source</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No data sources configured
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.type}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleSync(s.id)}>
                        Sync
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
