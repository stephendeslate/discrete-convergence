import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'default' && 'border-[var(--border)] bg-[var(--card)]',
        variant === 'destructive' &&
          'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]',
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export { Alert };
