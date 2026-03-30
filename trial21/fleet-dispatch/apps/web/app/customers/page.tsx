import { getCustomers } from '@/lib/actions';

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <main>
      <h1>Customers</h1>
      <section aria-label="Customer list">
        <h2>All Customers ({customers.total})</h2>
        <ul>
          {customers.data.map((c: { id: string; name: string; email: string; address: string }) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — {c.email} — {c.address}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
