import Link from 'next/link';
import { logoutAction } from '@/lib/actions';
import { Button } from './ui/button';

export function AppHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center px-6">
        <Link href="/dashboard" className="font-bold text-lg mr-6">
          Analytics Engine
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboards
          </Link>
          <Link href="/data-sources" className="text-muted-foreground hover:text-foreground transition-colors">
            Data Sources
          </Link>
          <Link href="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
            Settings
          </Link>
        </nav>
        <div className="ml-auto">
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
