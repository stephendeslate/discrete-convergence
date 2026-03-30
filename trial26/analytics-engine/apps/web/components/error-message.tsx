import { cn } from '../lib/utils';

export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div role="alert" className={cn('rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200', className)}>
      {message}
    </div>
  );
}
