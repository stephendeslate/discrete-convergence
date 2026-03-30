// TRACED:FD-WEB-024 — Navigation bar component
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/routes', label: 'Routes' },
  { href: '/dispatches', label: 'Dispatches' },
  { href: '/trips', label: 'Trips' },
  { href: '/maintenance', label: 'Maintenance' },
  { href: '/zones', label: 'Zones' },
  { href: '/settings', label: 'Settings' },
];

export default function NavBar() {
  return (
    <nav className={cn('bg-white shadow-sm border-b')}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/dashboard" className="text-xl font-bold text-blue-600">
              Fleet Dispatch
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
