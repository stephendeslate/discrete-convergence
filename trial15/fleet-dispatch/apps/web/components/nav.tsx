import Link from 'next/link';
import { Separator } from './ui/separator';

// TRACED: FD-UI-002
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-[var(--primary)]">
              Fleet Dispatch
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-sm hover:text-[var(--primary)]">
                Dashboard
              </Link>
              <Link href="/vehicles" className="text-sm hover:text-[var(--primary)]">
                Vehicles
              </Link>
              <Link href="/drivers" className="text-sm hover:text-[var(--primary)]">
                Drivers
              </Link>
              <Link href="/dispatches" className="text-sm hover:text-[var(--primary)]">
                Dispatches
              </Link>
              <Link href="/routes" className="text-sm hover:text-[var(--primary)]">
                Routes
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="text-sm hover:text-[var(--primary)]">
              Settings
            </Link>
            <Link href="/login" className="text-sm hover:text-[var(--primary)]">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
