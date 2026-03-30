import Link from 'next/link';
import { APP_VERSION } from '@analytics-engine/shared';

export default function HomePage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Analytics Engine</h1>
      <p className="text-lg mb-8" style={{ color: 'var(--muted)' }}>
        Real-time analytics dashboard platform v{APP_VERSION}
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg px-6 py-3 font-medium"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="rounded-lg px-6 py-3 font-medium border"
          style={{ borderColor: 'var(--border)' }}
        >
          Register
        </Link>
      </div>
    </div>
  );
}
