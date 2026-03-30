// TRACED:EM-UI-005
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@event-management/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" placeholder="Your organization name" />
          </div>
          <Button>Save Changes</Button>
          <p className="text-xs text-[var(--muted-foreground)]">
            App Version: {APP_VERSION}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
