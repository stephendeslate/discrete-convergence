import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
        variant === 'default' && 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)]',
        variant === 'secondary' && 'border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        variant === 'destructive' && 'border-transparent bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        variant === 'outline' && 'text-[var(--foreground)]',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
