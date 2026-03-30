import { APP_VERSION } from '@analytics-engine/shared';

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Analytics Engine</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Multi-tenant embeddable analytics for SaaS companies
      </p>
      <p className="text-sm text-[var(--muted-foreground)]">
        Version {APP_VERSION}
      </p>
    </div>
  );
}
