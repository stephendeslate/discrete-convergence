import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Event Management
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
            Events
          </Link>
          <Link href="/venues" className="text-sm text-gray-600 hover:text-gray-900">
            Venues
          </Link>
          <Link href="/attendees" className="text-sm text-gray-600 hover:text-gray-900">
            Attendees
          </Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
            Settings
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
