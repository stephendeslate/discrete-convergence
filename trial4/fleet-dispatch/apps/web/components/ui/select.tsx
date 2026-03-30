'use client';
import * as React from 'react';
import { cn } from '../../lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType>({
  value: '',
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

function Select({ children, name, defaultValue = '' }: { children: React.ReactNode; name?: string; defaultValue?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange: setValue, open, setOpen }}>
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen, open } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]',
        className,
      )}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={cn('absolute z-50 mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--card)] shadow-md', className)}>
      {children}
    </div>
  );
}

function SelectItem({ children, value }: { children: React.ReactNode; value: string }) {
  const { onValueChange, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--accent)]"
      onClick={() => { onValueChange(value); setOpen(false); }}
    >
      {children}
    </button>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
