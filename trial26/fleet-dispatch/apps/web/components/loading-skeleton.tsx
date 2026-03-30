// TRACED:FD-WEB-032 — Loading skeleton component
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export default function LoadingSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className={cn('bg-white rounded-lg shadow p-6 animate-pulse dark:bg-gray-800', className)}>
      <span className="sr-only">Loading...</span>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
