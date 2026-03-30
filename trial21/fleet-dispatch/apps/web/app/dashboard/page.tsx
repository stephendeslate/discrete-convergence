import Link from 'next/link';
import { getWorkOrders } from '@/lib/actions';

export default async function DashboardPage() {
  const workOrders = await getWorkOrders();

  return (
    <main>
      <h1>Dispatch Dashboard</h1>
      <nav aria-label="Dashboard navigation">
        <ul>
          <li><Link href="/work-orders">Work Orders</Link></li>
          <li><Link href="/technicians">Technicians</Link></li>
          <li><Link href="/customers">Customers</Link></li>
          <li><Link href="/routes">Routes</Link></li>
          <li><Link href="/invoices">Invoices</Link></li>
          <li><Link href="/settings">Settings</Link></li>
        </ul>
      </nav>
      <section aria-label="Work order summary">
        <h2>Work Orders</h2>
        <p>Total: {workOrders.total}</p>
        <div aria-label="Work order kanban board">
          {workOrders.data.map((wo: { id: string; title: string; status: string; sequenceNumber: string }) => (
            <article key={wo.id}>
              <h3>
                <Link href={`/work-orders/${wo.id}`}>{wo.sequenceNumber}: {wo.title}</Link>
              </h3>
              <p>Status: {wo.status}</p>
            </article>
          ))}
        </div>
      </section>
      <section aria-label="Map view placeholder">
        <h2>Map</h2>
        <p>Map view with technician locations (requires Leaflet)</p>
      </section>
    </main>
  );
}
