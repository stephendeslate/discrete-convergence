'use client';

import dynamic from 'next/dynamic';

/**
 * Dynamically loaded Leaflet map component — SSR disabled.
 * Uses OpenStreetMap tiles (NOT Google Maps).
 * TRACED: FD-FE-010
 */
const LeafletMap = dynamic(
  () => import('./leaflet-map-inner').then((mod) => mod.LeafletMapInner),
  { ssr: false, loading: () => <div aria-label="Map loading">Loading map...</div> },
);

interface DispatchMapProps {
  markers?: Array<{ lat: number; lng: number; label: string }>;
}

export function DispatchMap({ markers }: DispatchMapProps) {
  return (
    <div aria-label="Dispatch map" style={{ height: '400px', width: '100%' }}>
      <LeafletMap markers={markers} />
    </div>
  );
}
