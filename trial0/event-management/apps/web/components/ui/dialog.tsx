import { type HTMLAttributes, type MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}

function Dialog({ open, onClose, children, className, ...props }: DialogProps) {
  if (!open) return null;

  const handleBackdrop = (e: ReactMouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div className={cn('bg-[var(--card)] rounded-lg shadow-lg p-6 max-w-lg w-full mx-4', className)} {...props}>
        {children}
      </div>
    </div>
  );
}

export { Dialog };
