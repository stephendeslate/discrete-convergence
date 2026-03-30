// TRACED:WEB-SESSION-LIST
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  eventId: string;
}

export function SessionList({ sessions }: { sessions: Session[] }) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  if (loading) {
    return <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Loading sessions...</div>;
  }

  if (error) {
    return <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>;
  }

  if (sessions.length === 0) {
    return <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No sessions scheduled.</p>;
  }

  return (
    <div className={cn('space-y-4')}>
      {sessions.map((s) => (
        <div key={s.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
          <h3 className={cn('font-semibold dark:text-white')}>{s.title}</h3>
          {s.description && <p className={cn('text-sm text-gray-600 mt-1 dark:text-gray-400')}>{s.description}</p>}
          <div className={cn('flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400')}>
            <span>Start: {new Date(s.startTime).toLocaleString()}</span>
            <span>End: {new Date(s.endTime).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
