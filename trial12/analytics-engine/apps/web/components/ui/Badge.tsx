import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'bg-[var(--primary)] text-[var(--primary-foreground)]',
        variant === 'secondary' && 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        variant === 'destructive' && 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
        variant === 'outline' && 'border border-[var(--border)]',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
