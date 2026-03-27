import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
        variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
        className,
      )}
      role="alert"
      {...props}
    />
  ),
);
Toast.displayName = 'Toast';

export { Toast };
