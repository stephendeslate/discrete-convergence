import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Analytics Engine
      </h1>
      <p className="text-lg text-[var(--muted-foreground)]">
        Multi-tenant analytics dashboard platform
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
