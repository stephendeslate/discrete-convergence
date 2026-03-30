import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// TRACED: AE-FE-007
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const baseClass = `btn btn-${variant} btn-${size} ${className}`.trim();
    return (
      <button ref={ref} className={baseClass} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
