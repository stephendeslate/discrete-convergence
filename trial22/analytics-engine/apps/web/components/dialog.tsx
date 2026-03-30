'use client';

import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react';

export interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
  title: string;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, title, children, className = '', ...props }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLDialogElement>) ?? dialogRef;

    useEffect(() => {
      const dialog = resolvedRef.current;
      if (!dialog) return;
      if (open && !dialog.open) {
        dialog.showModal();
      } else if (!open && dialog.open) {
        dialog.close();
      }
    }, [open, resolvedRef]);

    return (
      <dialog
        ref={resolvedRef}
        className={`dialog ${className}`.trim()}
        onClose={onClose}
        aria-labelledby="dialog-title"
        {...props}
      >
        <h2 id="dialog-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </dialog>
    );
  },
);

Dialog.displayName = 'Dialog';
