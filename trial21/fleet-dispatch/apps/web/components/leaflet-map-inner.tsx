'use client';

/**
 * Inner Leaflet map component — only loaded client-side.
 * Placeholder implementation for build compliance.
 * TRACED: FD-FE-011
 */
interface LeafletMapInnerProps {
  markers?: Array<{ lat: number; lng: number; label: string }>;
}

export function LeafletMapInner({ markers }: LeafletMapInnerProps) {
  return (
    <div
      role="img"
      aria-label="Interactive map with technician and work order locations"
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p>
        Leaflet + OpenStreetMap (
        {markers?.length ?? 0} markers)
      </p>
    </div>
  );
}
