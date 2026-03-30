import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { APP_VERSION } from '@analytics-engine/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Info</CardTitle>
          <CardDescription>System information and configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Version</dt>
              <dd className="text-[var(--muted-foreground)]">{APP_VERSION}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Environment</dt>
              <dd className="text-[var(--muted-foreground)]">Production</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
