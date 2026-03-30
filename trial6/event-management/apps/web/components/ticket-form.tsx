// TRACED:EM-FE-005 — Ticket creation/edit form component
'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

interface TicketFormProps {
  eventId: string;
  onSubmit: (data: {
    type: string;
    price: string;
    quantity: number;
    eventId: string;
  }) => Promise<{ success: boolean; error?: string }>;
  initialData?: {
    type: string;
    price: string;
    quantity: number;
  };
}

const ticketTypeOptions = [
  { value: 'GENERAL', label: 'General Admission' },
  { value: 'VIP', label: 'VIP' },
  { value: 'EARLY_BIRD', label: 'Early Bird' },
];

export function TicketForm({ eventId, onSubmit, initialData }: TicketFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const price = formData.get('price') as string;
    const quantity = parseInt(formData.get('quantity') as string, 10);

    if (!type || !price || isNaN(quantity) || quantity <= 0) {
      setError('All fields are required. Quantity must be greater than 0.');
      setLoading(false);
      return;
    }

    const result = await onSubmit({ type, price, quantity, eventId });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to save ticket');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="type" required>Ticket Type</Label>
        <Select
          id="type"
          name="type"
          options={ticketTypeOptions}
          placeholder="Select type..."
          defaultValue={initialData?.type ?? ''}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="price" required>Price</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          defaultValue={initialData?.price ?? ''}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="quantity" required>Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          placeholder="100"
          defaultValue={initialData?.quantity?.toString() ?? ''}
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Ticket'}
      </Button>
    </form>
  );
}
