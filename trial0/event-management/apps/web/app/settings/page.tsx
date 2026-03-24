import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" name="orgName" placeholder="Your organization" />
            </div>
            <div>
              <Label htmlFor="orgSlug">Slug</Label>
              <Input id="orgSlug" name="orgSlug" placeholder="your-org" />
            </div>
            <Button type="submit" className="self-start">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-[var(--muted-foreground)]">Receive email updates about your events</p>
            </div>
            <Switch id="emailNotif" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
