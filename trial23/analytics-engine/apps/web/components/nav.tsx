import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Nav({ className }: { className?: string }) {
  return (
    <nav className={cn('border-b border-[var(--border)] bg-[var(--card)]', className)}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-bold">
          Analytics Engine
        </Link>
        <ul className="flex items-center gap-6">
          <li>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Dashboards
            </Link>
          </li>
          <li>
            <Link
              href="/data-sources"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Data Sources
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
