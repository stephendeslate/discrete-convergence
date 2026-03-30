import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fleet Dispatch',
  description: 'Field service dispatch management platform',
};

function Nav() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-3" role="navigation" aria-label="Main navigation">
      <div className="flex items-center gap-6">
        <a href="/" className="text-lg font-bold">Fleet Dispatch</a>
        <a href="/work-orders" className="hover:text-gray-300">Work Orders</a>
        <a href="/technicians" className="hover:text-gray-300">Technicians</a>
        <a href="/customers" className="hover:text-gray-300">Customers</a>
        <a href="/routes" className="hover:text-gray-300">Routes</a>
        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
        <a href="/data-sources" className="hover:text-gray-300">Data Sources</a>
        <a href="/settings" className="hover:text-gray-300">Settings</a>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Nav />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
