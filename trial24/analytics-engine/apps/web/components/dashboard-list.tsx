// TRACED:WEB-DASHBOARD-LIST — Dashboard list component
'use client';

import { Suspense, useState } from 'react';
import { deleteDashboardAction } from '@/lib/actions';
import { CreateDashboardForm } from './create-dashboard-form';
import { cn } from '@/lib/utils';

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
}

export function DashboardList({ dashboards }: { dashboards: Dashboard[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Delete this dashboard?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteDashboardAction(id);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('space-y-4')}>
      <Suspense fallback={<div role="status" aria-busy="true">Loading form...</div>}>
        <CreateDashboardForm />
      </Suspense>
      {error && <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-md p-3 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>{error}</div>}
      {loading && <div role="status" aria-busy="true" className={cn('text-gray-500 dark:text-gray-400')}>Processing...</div>}
      {dashboards.length === 0 ? (
        <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No dashboards yet. Create one above.</p>
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
          {dashboards.map((d) => (
            <div key={d.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
              <h3 className={cn('font-semibold dark:text-white')}>{d.name}</h3>
              {d.description && <p className={cn('text-sm text-gray-600 mt-1 dark:text-gray-400')}>{d.description}</p>}
              <div className="mt-3 flex items-center justify-between">
                <span className={cn('text-xs text-gray-500 dark:text-gray-400')}>{new Date(d.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className={cn('text-sm text-red-600 hover:text-red-800 dark:text-red-400')}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
