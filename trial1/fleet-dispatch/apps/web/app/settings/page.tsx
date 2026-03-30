'use client';

import { validateEnvVars } from '@fleet-dispatch/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Company Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure your company profile, branding, and operational preferences.
          </p>
          <Button className="mt-4">Edit Company</Button>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members, roles, and permissions.
          </p>
          <Button className="mt-4">Manage Users</Button>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Configure notification preferences for assignments and status changes.
          </p>
          <Button className="mt-4">Configure</Button>
        </Card>
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Integration</h2>
          <p className="text-sm text-muted-foreground">
            Connect external services and configure API access.
          </p>
          <Button className="mt-4">Setup</Button>
        </Card>
      </div>
    </div>
  );
}
