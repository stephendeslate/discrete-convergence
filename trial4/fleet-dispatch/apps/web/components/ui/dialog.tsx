'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const actualOpen = open ?? isOpen;
  const actualOnChange = onOpenChange ?? setIsOpen;

  if (!actualOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => actualOnChange(false)} aria-hidden="true" />
      <div className="relative z-50">{children}</div>
    </div>
  );
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg', className)}>
      {children}
    </div>
  );
}

function DialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle };
