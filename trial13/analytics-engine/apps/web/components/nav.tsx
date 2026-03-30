import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// TRACED: AE-FE-008
export function Nav() {
  return (
    <nav className="border-b border-[var(--border)]">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboards</Button>
          </Link>
          <Link href="/data-sources">
            <Button variant="ghost">Data Sources</Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
