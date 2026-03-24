import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

const items: SidebarItem[] = [
  { label: 'Dashboards', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Data Sources', href: '/data-sources', icon: 'Database' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

interface SidebarProps {
  activePath?: string;
}

export function Sidebar({ activePath }: SidebarProps): React.JSX.Element {
  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4">
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activePath === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
