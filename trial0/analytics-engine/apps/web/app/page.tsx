import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@analytics-engine/shared';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-4xl font-bold">Analytics Engine</h1>
      <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
        Multi-tenant embeddable analytics platform — v{APP_VERSION}
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline">Register</Button>
        </Link>
      </div>
    </div>
  );
}
