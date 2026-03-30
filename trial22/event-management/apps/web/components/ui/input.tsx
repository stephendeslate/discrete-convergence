import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium">{label}</label>}
      <input
        id={id}
        className={cn(
          'w-full px-3 py-2 border border-[var(--border)] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]',
          className,
        )}
        {...props}
      />
    </div>
  );
}
