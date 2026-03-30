import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

const DialogOverlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('fixed inset-0 bg-black/50 z-50', className)} {...props} />
  ),
);
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg w-full max-w-lg',
        className,
      )}
      {...props}
    />
  ),
);
DialogContent.displayName = 'DialogContent';

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
  ),
);
DialogTitle.displayName = 'DialogTitle';

export { DialogOverlay, DialogContent, DialogTitle };
