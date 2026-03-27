// TRACED: EM-FE-007 — Toast component (shadcn/ui simplified)
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  variant?: 'default' | 'destructive';
  onClose: () => void;
}

function Toast({ message, variant = 'default', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-md border px-4 py-3 shadow-lg',
        variant === 'destructive'
          ? 'border-destructive bg-destructive text-destructive-foreground'
          : 'border-border bg-background text-foreground',
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">{message}</p>
        <button onClick={onClose} className="text-sm font-medium hover:opacity-70">
          Close
        </button>
      </div>
    </div>
  );
}

export { Toast };
