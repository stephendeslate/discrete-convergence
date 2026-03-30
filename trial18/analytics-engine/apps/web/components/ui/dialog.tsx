'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const actualOpen = open ?? isOpen;
  const handleChange = onOpenChange ?? setIsOpen;

  if (!actualOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => handleChange(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900" role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}

function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4', className)}>{children}</div>;
}

export { Dialog, DialogTitle, DialogContent };
