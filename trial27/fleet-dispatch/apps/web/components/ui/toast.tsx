// TRACED: FD-FE-001 — Toast notification component
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeClasses: Record<string, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg',
        typeClasses[type],
      )}
      role="alert"
    >
      <div className="flex items-center justify-between gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 font-bold" aria-label="Close notification">
          &times;
        </button>
      </div>
    </div>
  );
}

export { Toast };
