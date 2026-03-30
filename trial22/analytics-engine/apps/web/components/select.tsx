import { SelectHTMLAttributes, forwardRef } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, id, className = '', ...props }, ref) => {
    return (
      <div className="select-group">
        {label && <label htmlFor={id}>{label}</label>}
        <select
          ref={ref}
          id={id}
          className={`select ${error ? 'select-error' : ''} ${className}`.trim()}
          aria-invalid={!!error}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="select-error-message">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
