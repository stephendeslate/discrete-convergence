import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
          'disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' &&
            'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
          variant === 'destructive' &&
            'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
          variant === 'outline' &&
            'border border-[var(--border)] bg-transparent hover:bg-[var(--accent)]',
          variant === 'ghost' && 'hover:bg-[var(--accent)]',
          size === 'default' && 'h-10 px-4 py-2 text-sm',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'lg' && 'h-12 px-6 text-base',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
