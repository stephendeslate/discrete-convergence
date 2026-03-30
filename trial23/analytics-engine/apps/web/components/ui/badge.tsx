import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
        variant === 'default' && 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        variant === 'secondary' && 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        variant === 'destructive' && 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        variant === 'outline' && 'border border-[var(--border)] text-[var(--foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
