import { getSession } from '@/lib/actions';
import { Card } from '@/components/card';
import { Navigation } from '@/components/navigation';

export default async function SettingsPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen">
      <Navigation role={session?.role ?? 'VIEWER'} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd>{session?.name ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd>{session?.email ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd>{session?.role ?? 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
              <dd className="text-xs text-gray-400">{session?.tenantId ?? 'Unknown'}</dd>
            </div>
          </dl>
        </Card>
      </main>
    </div>
  );
}
