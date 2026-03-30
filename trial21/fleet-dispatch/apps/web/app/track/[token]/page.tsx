import { getTrackingInfo } from '@/lib/actions';

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

/**
 * Public customer tracking portal — no auth required.
 * TRACED: FD-FE-007
 */
export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const tracking = await getTrackingInfo(token);

  if (!tracking) {
    return (
      <main>
        <h1>Tracking Not Available</h1>
        <p>The tracking link is invalid or has expired.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Track Work Order: {tracking.sequenceNumber}</h1>
      <section aria-label="Tracking details">
        <h2>{tracking.title}</h2>
        <dl>
          <dt>Status</dt>
          <dd>{tracking.status}</dd>
          {tracking.technician && (
            <>
              <dt>Technician</dt>
              <dd>{tracking.technician.name}</dd>
            </>
          )}
        </dl>
      </section>
      <section aria-label="Live map">
        <h2>Live Location</h2>
        <p>Map placeholder — Leaflet integration for live GPS tracking</p>
      </section>
    </main>
  );
}
