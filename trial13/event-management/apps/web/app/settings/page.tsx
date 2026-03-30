import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { logoutAction } from '@/lib/actions';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[var(--muted-foreground)]">Manage your account settings and preferences.</p>
          <Separator />
          <form action={logoutAction}>
            <Button variant="destructive" type="submit">Sign Out</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
