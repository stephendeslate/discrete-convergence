'use client';

import { useEffect, useRef } from 'react';

export default function SettingsError({ error, reset }: { error: Error; reset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1} style={{ padding: '1rem', border: '1px solid var(--destructive)', borderRadius: '8px' }}>
      <h2 style={{ color: 'var(--destructive)', fontWeight: 'bold' }}>Failed to load settings</h2>
      <p style={{ margin: '0.5rem 0' }}>{error.message}</p>
      <button onClick={reset} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--primary-foreground)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try again</button>
    </div>
  );
}
