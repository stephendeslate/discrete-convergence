import * as React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps): React.JSX.Element | null {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') onOpenChange(false); }}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />
      <div className={cn('relative z-50 rounded-lg bg-[var(--background)] p-6 shadow-lg border')} style={{ borderColor: 'var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

export { Dialog, DialogTitle, DialogContent };
