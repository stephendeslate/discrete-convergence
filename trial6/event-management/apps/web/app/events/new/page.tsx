'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent } from '@/lib/actions';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Card } from '@/components/card';

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    venueId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await createEvent({
      title: form.title,
      description: form.description || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      venueId: form.venueId || undefined,
    });
    if (result.success && result.id) {
      router.push(`/events/${result.id}`);
    } else {
      setError(result.error ?? 'Failed to create event');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-lg p-8">
        <h1 className="mb-6 text-2xl font-bold">Create Event</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">Title</label>
            <Input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
              <Input id="startDate" type="datetime-local" value={form.startDate} onChange={(e) => updateField('startDate', e.target.value)} required />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
              <Input id="endDate" type="datetime-local" value={form.endDate} onChange={(e) => updateField('endDate', e.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="venueId" className="block text-sm font-medium">Venue ID (optional)</label>
            <Input id="venueId" value={form.venueId} onChange={(e) => updateField('venueId', e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
