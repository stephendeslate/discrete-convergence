'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/events', label: 'Events' },
  { href: '/venues', label: 'Venues' },
  { href: '/attendees', label: 'Attendees' },
  { href: '/registrations', label: 'Registrations' },
];

// TRACED: EM-FE-006 — Navigation with active state and keyboard accessibility
export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background" role="banner">
      <nav className="container mx-auto px-4 flex h-14 items-center gap-6" aria-label="Main navigation">
        <Link href="/" className="font-bold text-lg">
          EM Platform
        </Link>
        <div className="flex gap-4" role="navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href="/settings"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Settings
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}
