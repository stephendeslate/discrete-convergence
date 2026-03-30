// TRACED:EM-FE-008
'use client';

export function LoadingSkeleton() {
  return (
    <div role="status" aria-busy="true" className="animate-pulse space-y-4">
      <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
