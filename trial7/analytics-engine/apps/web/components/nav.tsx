import Link from 'next/link';
import { cn } from '@/lib/utils';

// TRACED:AE-UI-005
export function Nav(): React.JSX.Element {
  return (
    <nav
      className={cn(
        'flex items-center justify-between px-6 py-4 border-b',
      )}
      style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <Link href="/" className="text-xl font-bold">
        Analytics Engine
      </Link>
      <div className="flex gap-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/data-sources" className="hover:underline">
          Data Sources
        </Link>
        <Link href="/settings" className="hover:underline">
          Settings
        </Link>
      </div>
    </nav>
  );
}
