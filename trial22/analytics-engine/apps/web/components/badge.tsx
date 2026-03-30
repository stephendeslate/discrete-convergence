import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <span ref={ref} className={`badge badge-${variant} ${className}`.trim()} {...props}>
        {children}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
