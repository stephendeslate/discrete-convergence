import Link from 'next/link';
import { logoutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';

// TRACED: EM-UI-003
export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-lg font-bold text-blue-600">
            Event Manager
          </Link>
          <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">
            Events
          </Link>
          <Link href="/venues" className="text-sm text-gray-600 hover:text-gray-900">
            Venues
          </Link>
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
            Settings
          </Link>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" size="sm" type="submit">
            Logout
          </Button>
        </form>
      </div>
    </nav>
  );
}
