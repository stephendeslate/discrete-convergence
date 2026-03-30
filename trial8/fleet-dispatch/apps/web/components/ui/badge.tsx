import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'border-transparent bg-blue-100 text-blue-800',
        variant === 'success' && 'border-transparent bg-green-100 text-green-800',
        variant === 'warning' && 'border-transparent bg-yellow-100 text-yellow-800',
        variant === 'destructive' && 'border-transparent bg-red-100 text-red-800',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
