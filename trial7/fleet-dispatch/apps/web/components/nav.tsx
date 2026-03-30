import Link from 'next/link';
import { cn } from '@/lib/utils';

// TRACED:FD-UI-006
export function Nav() {
  return (
    <nav className={cn('border-b border-gray-200 bg-white px-4 py-3')} role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-bold">
          Fleet Dispatch
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/vehicles" className="hover:underline">
            Vehicles
          </Link>
          <Link href="/drivers" className="hover:underline">
            Drivers
          </Link>
          <Link href="/routes" className="hover:underline">
            Routes
          </Link>
          <Link href="/dispatches" className="hover:underline">
            Dispatches
          </Link>
          <Link href="/settings" className="hover:underline">
            Settings
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
