import Link from 'next/link';
import { APP_VERSION } from '@fleet-dispatch/shared';

// TRACED:FD-UI-003
export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Fleet Dispatch
          </Link>
          <div className="hidden space-x-4 md:flex">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/work-orders" className="text-gray-600 hover:text-gray-900">
              Work Orders
            </Link>
            <Link href="/technicians" className="text-gray-600 hover:text-gray-900">
              Technicians
            </Link>
            <Link href="/customers" className="text-gray-600 hover:text-gray-900">
              Customers
            </Link>
            <Link href="/routes" className="text-gray-600 hover:text-gray-900">
              Routes
            </Link>
            <Link href="/invoices" className="text-gray-600 hover:text-gray-900">
              Invoices
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">v{APP_VERSION}</span>
          <Link href="/settings" className="text-gray-600 hover:text-gray-900">
            Settings
          </Link>
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
