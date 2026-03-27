// TRACED: FD-FE-011 — Navigation with aria-label="Main navigation"
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/dispatch-jobs', label: 'Dispatch Jobs' },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/audit-log', label: 'Audit Log' },
  { href: '/settings', label: 'Settings' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
          Fleet Dispatch
        </Link>
        <div className="flex items-center space-x-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
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
