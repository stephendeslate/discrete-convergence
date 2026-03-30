'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/actions';

// TRACED: AE-FE-005
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboards' },
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/settings', label: 'Settings' },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold text-[var(--foreground)]">
            Analytics Engine
          </Link>
          <div className="flex items-center gap-1" role="list">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="listitem"
                aria-current={pathname === item.href ? 'page' : undefined}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  pathname === item.href
                    ? 'bg-[var(--muted)] text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </nav>
  );
}
