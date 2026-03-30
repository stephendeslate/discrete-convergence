import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--muted)]', className)}
      style={{ opacity: 0.2 }}
      {...props}
    />
  );
}

export { Skeleton };
