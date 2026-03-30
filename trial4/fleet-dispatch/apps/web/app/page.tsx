import { APP_VERSION } from '@fleet-dispatch/shared';

export default function HomePage() {
  return (
    <div className="py-12 text-center">
      <h1 className="text-4xl font-bold">Fleet Dispatch</h1>
      <p className="mt-4 text-lg" style={{ color: 'var(--muted-foreground)' }}>
        Multi-tenant field service dispatch platform
      </p>
      <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Version {APP_VERSION}
      </p>
    </div>
  );
}
