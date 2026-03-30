import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Nav() {
  return (
    <nav className={cn('border-b border-gray-200 bg-white px-4 py-3')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-blue-600">
          Fleet Dispatch
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/vehicles" className="text-sm text-gray-600 hover:text-gray-900">
            Vehicles
          </Link>
          <Link href="/drivers" className="text-sm text-gray-600 hover:text-gray-900">
            Drivers
          </Link>
          <Link href="/routes" className="text-sm text-gray-600 hover:text-gray-900">
            Routes
          </Link>
          <Link href="/trips" className="text-sm text-gray-600 hover:text-gray-900">
            Trips
          </Link>
          <Link href="/maintenance" className="text-sm text-gray-600 hover:text-gray-900">
            Maintenance
          </Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
