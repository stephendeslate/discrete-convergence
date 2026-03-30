import * as React from 'react';
import { cn } from '@/lib/utils';

// TRACED: FD-UI-014
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--muted)]', className)}
      {...props}
    />
  );
}

export { Skeleton };
