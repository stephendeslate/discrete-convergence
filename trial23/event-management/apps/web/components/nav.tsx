import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-gray-900">
          EventMgr
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/events" className="text-gray-600 hover:text-gray-900">
            Events
          </Link>
          <Link href="/venues" className="text-gray-600 hover:text-gray-900">
            Venues
          </Link>
          <Link href="/registrations" className="text-gray-600 hover:text-gray-900">
            Registrations
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/data-sources" className="text-gray-600 hover:text-gray-900">
            Data Sources
          </Link>
          <Link href="/settings" className="text-gray-600 hover:text-gray-900">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
