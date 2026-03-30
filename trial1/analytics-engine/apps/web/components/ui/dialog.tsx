'use client';

import { cn } from '../../lib/utils';
import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react';

export interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, className, children, ...props }, ref) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
      const el = dialogRef.current;
      if (!el) return;
      if (open && !el.open) el.showModal();
      if (!open && el.open) el.close();
    }, [open]);

    return (
      <dialog
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        onClose={onClose}
        className={cn('rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--card-foreground)] shadow-lg backdrop:bg-black/50', className)}
        {...props}
      >
        {children}
      </dialog>
    );
  },
);
Dialog.displayName = 'Dialog';

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-lg font-semibold', className)} {...props} />;
}

export function DialogContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4', className)} {...props} />;
}
