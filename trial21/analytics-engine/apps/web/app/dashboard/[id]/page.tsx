import { getDashboard } from '@/lib/actions';
import { DashboardBuilder } from '@/components/dashboard-builder';

interface DashboardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardDetailPage({ params }: DashboardDetailPageProps) {
  const { id } = await params;
  const dashboard = await getDashboard(id) as { id: string; title: string; description?: string; widgets: unknown[] } | null;

  if (!dashboard) {
    return (
      <main>
        <h1>Dashboard Not Found</h1>
        <p>The requested dashboard could not be found.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>{dashboard.title}</h1>
      {dashboard.description && <p>{dashboard.description}</p>}
      <DashboardBuilder dashboardId={dashboard.id} widgets={dashboard.widgets} />
    </main>
  );
}
