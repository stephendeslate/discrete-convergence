'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { logoutAction } from '@/lib/actions';

const navItems = [
  { href: '/dashboard', label: 'Dashboards' },
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/settings', label: 'Settings' },
];

export function NavHeader() {
  const pathname = usePathname();

  async function handleLogout() {
    await logoutAction();
    window.location.href = '/login';
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Analytics Engine
          </Link>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  pathname.startsWith(item.href)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
