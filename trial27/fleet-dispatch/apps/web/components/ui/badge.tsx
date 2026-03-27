// TRACED: FD-FE-004 — Badge component
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const variantClasses: Record<string, string> = {
  default: 'border-transparent bg-blue-600 text-white',
  secondary: 'border-transparent bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
  destructive: 'border-transparent bg-red-600 text-white',
  outline: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
