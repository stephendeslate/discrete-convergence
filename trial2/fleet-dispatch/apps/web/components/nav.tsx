import Link from 'next/link';
import { APP_VERSION } from '@fleet-dispatch/shared';

/**
 * Main navigation component.
 * TRACED:FD-UI-003
 */
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Fleet Dispatch
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:text-[var(--primary)]">
              Dashboard
            </Link>
            <Link href="/work-orders" className="text-sm hover:text-[var(--primary)]">
              Work Orders
            </Link>
            <Link href="/technicians" className="text-sm hover:text-[var(--primary)]">
              Technicians
            </Link>
            <Link href="/invoices" className="text-sm hover:text-[var(--primary)]">
              Invoices
            </Link>
            <Link href="/settings" className="text-sm hover:text-[var(--primary)]">
              Settings
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--muted-foreground)]">v{APP_VERSION}</span>
          <Link href="/login" className="text-sm hover:text-[var(--primary)]">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
