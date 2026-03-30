// TRACED:WEB-SPEAKER-LIST
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Speaker {
  id: string;
  name: string;
  bio: string | null;
  email: string;
  createdAt: string;
}

export function SpeakerList({ speakers }: { speakers: Speaker[] }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading speakers...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>;
  }

  if (speakers.length === 0) {
    return <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No speakers yet.</p>;
  }

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
      {speakers.map((s) => (
        <div key={s.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
          <h3 className={cn('font-semibold dark:text-white')}>{s.name}</h3>
          <p className={cn('text-sm text-gray-600 dark:text-gray-400')}>{s.email}</p>
          {s.bio && <p className={cn('text-sm text-gray-500 mt-1 dark:text-gray-400')}>{s.bio}</p>}
        </div>
      ))}
    </div>
  );
}
