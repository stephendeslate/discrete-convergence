'use client';

interface Dashboard {
  id: string;
  title: string;
  description?: string;
  status: string;
}

export default function DashboardList({ dashboards }: { dashboards: Dashboard[] }) {
  if (dashboards.length === 0) {
    return (
      <p className="text-[var(--muted-foreground)] text-center py-8">
        No dashboards found. Create your first dashboard above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dashboards.map((dashboard) => (
        <div
          key={dashboard.id}
          className="rounded-lg border border-[var(--border)] p-4 bg-[var(--card)] hover:bg-[var(--accent)] transition-colors"
        >
          <h3 className="font-semibold text-[var(--card-foreground)]">{dashboard.title}</h3>
          {dashboard.description && (
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{dashboard.description}</p>
          )}
          <span className="inline-block mt-2 rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--secondary-foreground)]">
            {dashboard.status}
          </span>
        </div>
      ))}
    </div>
  );
}
