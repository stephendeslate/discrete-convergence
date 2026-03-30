import { getSession } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{session?.email ?? 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{session?.role ?? 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tenant ID</p>
            <p className="font-mono text-sm">{session?.tenantId ?? 'Unknown'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
