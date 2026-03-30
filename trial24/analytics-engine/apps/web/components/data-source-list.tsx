// TRACED:WEB-DATASOURCE-LIST — Data source list component
'use client';

import { Suspense } from 'react';
import { CreateDataSourceForm } from './create-data-source-form';
import { cn } from '@/lib/utils';

interface DataSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export function DataSourceList({ dataSources }: { dataSources: DataSource[] }) {
  return (
    <div className={cn('space-y-4')}>
      <Suspense fallback={<div role="status" aria-busy="true">Loading form...</div>}>
        <CreateDataSourceForm />
      </Suspense>
      {dataSources.length === 0 ? (
        <p className={cn('text-gray-500 text-center py-8 dark:text-gray-400')}>No data sources configured.</p>
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
          {dataSources.map((ds) => (
            <div key={ds.id} className={cn('rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700')}>
              <div className="flex items-center justify-between">
                <h3 className={cn('font-semibold dark:text-white')}>{ds.name}</h3>
                <span className={cn(
                  'text-xs px-2 py-1 rounded',
                  ds.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
                )}>
                  {ds.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className={cn('text-sm text-gray-600 mt-1 dark:text-gray-400')}>{ds.type}</p>
              <span className={cn('text-xs text-gray-500 dark:text-gray-400')}>{new Date(ds.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
