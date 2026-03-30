import Link from 'next/link';
import { logoutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';

// TRACED: AE-UI-003
export function Nav() {
  return (
    <nav className="border-b bg-white" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">
            Analytics Engine
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Dashboards
            </Link>
            <Link href="/data-sources" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Data Sources
            </Link>
            <Link href="/settings" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Settings
            </Link>
          </div>
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" type="submit">
            Logout
          </Button>
        </form>
      </div>
    </nav>
  );
}
