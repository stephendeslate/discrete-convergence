import { getInvoices } from '@/lib/actions';

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <main>
      <h1>Invoice Management</h1>
      <section aria-label="Invoice list">
        <h2>All Invoices ({invoices.total})</h2>
        <table aria-label="Invoice table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {invoices.data.map((inv: { id: string; sequenceNumber: string; status: string; total: number; createdAt: string }) => (
              <tr key={inv.id}>
                <td>{inv.sequenceNumber}</td>
                <td>{inv.status}</td>
                <td>${Number(inv.total).toFixed(2)}</td>
                <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
