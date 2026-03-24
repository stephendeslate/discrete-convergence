import { logout } from '@/lib/actions';

interface NavigationProps {
  role: string;
}

export function Navigation({ role }: NavigationProps) {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <a href="/events" className="text-lg font-bold">Event Manager</a>
          <div className="flex gap-4 text-sm">
            <a href="/events" className="hover:text-blue-600">Events</a>
            <a href="/venues" className="hover:text-blue-600">Venues</a>
            <a href="/attendees" className="hover:text-blue-600">Attendees</a>
            {role === 'ADMIN' && (
              <a href="/settings" className="hover:text-blue-600">Settings</a>
            )}
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  );
}
