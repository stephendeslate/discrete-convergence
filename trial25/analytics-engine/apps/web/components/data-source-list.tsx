// TRACED:WEB-COMP-DSLIST — Data source list component
'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

interface DataSource {
  id: string;
  name: string;
  type: string;
  status?: string;
  lastSyncAt?: string;
}

interface DataSourceListProps {
  dataSources: DataSource[];
  token: string;
}

export function DataSourceList({ dataSources: initial, token: _token }: DataSourceListProps) {
  const [dataSources] = useState(initial);

  if (dataSources.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 mt-4">No data sources yet. Create one above.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {dataSources.map((ds) => (
        <div key={ds.id} className={cn('bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700')}>
          <h3 className="text-lg font-semibold">{ds.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Type: {ds.type}</p>
          {ds.status && <p className="text-sm mt-1">Status: <span className={ds.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>{ds.status}</span></p>}
          {ds.lastSyncAt && <p className="text-xs text-gray-400 mt-2">Last sync: {new Date(ds.lastSyncAt).toLocaleString()}</p>}
        </div>
      ))}
    </div>
  );
}
