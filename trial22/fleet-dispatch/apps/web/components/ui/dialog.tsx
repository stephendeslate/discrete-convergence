'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef, useEffect, useRef } from 'react';

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open, onClose, children, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      if (open) document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
        <div ref={ref} role="dialog" aria-modal="true" className={cn('bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-md w-full mx-4', className)} {...props}>
          {children}
        </div>
      </div>
    );
  },
);
Dialog.displayName = 'Dialog';

export { Dialog };
