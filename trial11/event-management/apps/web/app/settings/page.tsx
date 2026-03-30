import { getAppVersion } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function SettingsPage() {
  const version = await getAppVersion();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="text-sm">{version}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
