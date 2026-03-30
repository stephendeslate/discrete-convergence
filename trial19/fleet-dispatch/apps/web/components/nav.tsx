import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b p-4">
      <div className="flex items-center gap-6 max-w-7xl mx-auto">
        <Link href="/" className="font-bold text-lg">
          Fleet Dispatch
        </Link>
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
      </div>
    </nav>
  );
}
