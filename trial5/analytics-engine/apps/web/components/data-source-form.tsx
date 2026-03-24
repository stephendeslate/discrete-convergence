'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';
import { createDataSource } from '@/lib/actions';

const DATA_SOURCE_TYPES = ['POSTGRES', 'MYSQL', 'REST_API', 'CSV'];

export function DataSourceForm(): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('POSTGRES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createDataSource(name, type);
      setOpen(false);
      setName('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data source');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Data Source</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Connect a new external data source for analytics.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dsName">Name</Label>
            <Input
              id="dsName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Database"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dsType">Type</Label>
            <select
              id="dsType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {DATA_SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Data Source'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
