import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Multi-tenant fleet management and dispatch platform',
};

// TRACED: FD-FE-001
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b px-6 py-3 flex items-center gap-6">
          <a href="/" className="font-bold text-lg">Fleet Dispatch</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/vehicles" className="hover:underline">Vehicles</a>
          <a href="/drivers" className="hover:underline">Drivers</a>
          <a href="/routes" className="hover:underline">Routes</a>
          <a href="/trips" className="hover:underline">Trips</a>
          <a href="/dispatches" className="hover:underline">Dispatches</a>
          <a href="/settings" className="hover:underline">Settings</a>
          <div className="ml-auto flex gap-4">
            <a href="/login" className="hover:underline">Login</a>
            <a href="/register" className="hover:underline">Register</a>
          </div>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
