'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/fleet', label: 'Fleet' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/deliveries', label: 'Deliveries' },
  { href: '/routes', label: 'Routes' },
  { href: '/settings', label: 'Settings' },
];

export function Nav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-6 border-b px-6 py-3 bg-background">
      <Link href="/fleet" className="text-lg font-bold">
        Fleet Dispatch
      </Link>
      <div className="flex items-center space-x-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname.startsWith(item.href)
                ? 'text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
