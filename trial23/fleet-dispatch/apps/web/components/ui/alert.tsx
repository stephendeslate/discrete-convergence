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
        'rounded-lg border p-4',
        variant === 'default' && 'bg-gray-50 border-gray-200 text-gray-800',
        variant === 'destructive' && 'bg-red-50 border-red-200 text-red-800',
        className,
      )}
      {...props}
    />
  ),
);
Alert.displayName = 'Alert';

export { Alert };
