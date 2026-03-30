import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          Fleet Dispatch
        </Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/work-orders" className="hover:underline">Work Orders</Link>
          <Link href="/technicians" className="hover:underline">Technicians</Link>
          <Link href="/customers" className="hover:underline">Customers</Link>
          <Link href="/routes" className="hover:underline">Routes</Link>
          <Link href="/invoices" className="hover:underline">Invoices</Link>
          <Link href="/login" className="hover:underline">Login</Link>
        </div>
      </div>
    </nav>
  );
}
