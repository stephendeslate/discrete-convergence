import { forwardRef, useRef, useEffect, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onClose?: () => void;
}

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, className, children, ...props }, ref) => {
    const innerRef = useRef<HTMLDialogElement>(null);
    const dialogRef = (ref ?? innerRef) as React.RefObject<HTMLDialogElement>;

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open, dialogRef]);

    return (
      <dialog
        ref={dialogRef}
        className={cn(
          'rounded-lg border border-[var(--border)] bg-[var(--background)] p-6 shadow-lg backdrop:bg-black/50',
          className,
        )}
        onClose={onClose}
        {...props}
      >
        {children}
      </dialog>
    );
  },
);
Dialog.displayName = 'Dialog';

function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4', className)} {...props} />;
}

export { Dialog, DialogTitle, DialogContent };
