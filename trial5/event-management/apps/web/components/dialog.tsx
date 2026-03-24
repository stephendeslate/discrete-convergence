'use client';

import { useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';

interface DialogProps extends HTMLAttributes<HTMLDialogElement> {
  open: boolean;
  onClose: () => void;
  title: string;
}

export function Dialog({ open, onClose, title, children, className = '' }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`rounded-lg p-6 shadow-xl backdrop:bg-black/50 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      {children}
    </dialog>
  );
}
