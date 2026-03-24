'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dispatch', label: 'Dispatch' },
  { href: '/work-orders', label: 'Work Orders' },
  { href: '/technicians', label: 'Technicians' },
  { href: '/customers', label: 'Customers' },
  { href: '/routes', label: 'Routes' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/settings', label: 'Settings' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 gap-6">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          FleetDispatch
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent)]',
                pathname.startsWith(link.href)
                  ? 'bg-[var(--accent)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)]',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
