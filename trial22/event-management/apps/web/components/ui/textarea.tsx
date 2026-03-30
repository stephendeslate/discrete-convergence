import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ className, label, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium">{label}</label>}
      <textarea
        id={id}
        className={cn(
          'w-full px-3 py-2 border border-[var(--border)] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-h-[100px]',
          className,
        )}
        {...props}
      />
    </div>
  );
}
