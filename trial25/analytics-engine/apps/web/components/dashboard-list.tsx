// TRACED:WEB-COMP-DASHLIST — Dashboard list component with delete
'use client';

import { useState, Suspense } from 'react';
import { deleteDashboard } from '../lib/actions';
import { cn } from '../lib/utils';

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface DashboardListProps {
  dashboards: Dashboard[];
  token: string;
}

function DashboardCard({ dashboard, token, onDelete }: { dashboard: Dashboard; token: string; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this dashboard?')) return;
    setDeleting(true);
    const result = await deleteDashboard(dashboard.id, token);
    if (result.success) {
      onDelete(dashboard.id);
    }
    setDeleting(false);
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700', deleting && 'opacity-50')}>
      <h3 className="text-lg font-semibold">{dashboard.name}</h3>
      {dashboard.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{dashboard.description}</p>}
      <div className="mt-4 flex gap-2">
        <a href={`/dashboard/${dashboard.id}`} className="text-sm text-blue-600 hover:underline">View</a>
        <button onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 hover:underline disabled:opacity-50">
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export function DashboardList({ dashboards: initial, token }: DashboardListProps) {
  const [dashboards, setDashboards] = useState(initial);

  function handleDelete(id: string) {
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  }

  if (dashboards.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 mt-4">No dashboards yet. Create one above.</p>;
  }

  return (
    <Suspense fallback={<p>Loading dashboards...</p>}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {dashboards.map((d) => (
          <DashboardCard key={d.id} dashboard={d} token={token} onDelete={handleDelete} />
        ))}
      </div>
    </Suspense>
  );
}
