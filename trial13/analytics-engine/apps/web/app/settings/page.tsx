import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Profile</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Manage your account profile and preferences.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium">Notifications</h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Configure notification preferences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
