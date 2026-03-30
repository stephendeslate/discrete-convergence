import { apiFetch } from '@/lib/actions';

interface WorkOrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: WorkOrderDetailProps) {
  const { id } = await params;
  const res = await apiFetch(`/work-orders/${id}`);
  const workOrder = res.ok ? await res.json() : null;

  if (!workOrder) {
    return (
      <main>
        <h1>Work Order Not Found</h1>
        <p>The requested work order could not be found.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Work Order: {workOrder.sequenceNumber}</h1>
      <section aria-label="Work order details">
        <h2>{workOrder.title}</h2>
        <dl>
          <dt>Status</dt>
          <dd>{workOrder.status}</dd>
          <dt>Priority</dt>
          <dd>{workOrder.priority}</dd>
          <dt>Description</dt>
          <dd>{workOrder.description ?? 'No description'}</dd>
        </dl>
      </section>
      <section aria-label="Status history">
        <h2>Status History</h2>
        {workOrder.statusHistory?.map((h: { id: string; fromStatus: string; toStatus: string; createdAt: string }) => (
          <p key={h.id}>
            {h.fromStatus ?? 'Created'} → {h.toStatus} at{' '}
            {new Date(h.createdAt).toLocaleString()}
          </p>
        ))}
      </section>
    </main>
  );
}
