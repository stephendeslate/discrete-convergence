// TRACED:WEB-LOADING-SKELETON — Skeleton loading component
import { cn } from '@/lib/utils';

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-busy="true" className={cn('space-y-4')}>
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('animate-pulse rounded-lg border bg-white p-4 dark:bg-gray-800 dark:border-gray-700')}>
          <div className={cn('h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700')} />
          <div className={cn('h-3 bg-gray-200 rounded w-1/2 dark:bg-gray-700')} />
        </div>
      ))}
    </div>
  );
}
