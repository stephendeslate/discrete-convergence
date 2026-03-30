'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// TRACED: AE-UI-002
export function Nav() {
  return (
    <nav
      className={cn(
        'flex items-center gap-6 border-b px-6 py-3',
        'bg-[var(--card)] text-[var(--card-foreground)]',
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" className="text-lg font-bold text-[var(--primary)]">
        Analytics Engine
      </Link>
      <Link href="/dashboard" className="hover:text-[var(--primary)]">
        Dashboards
      </Link>
      <Link href="/widgets" className="hover:text-[var(--primary)]">
        Widgets
      </Link>
      <Link href="/data-sources" className="hover:text-[var(--primary)]">
        Data Sources
      </Link>
      <Link href="/settings" className="hover:text-[var(--primary)]">
        Settings
      </Link>
    </nav>
  );
}
