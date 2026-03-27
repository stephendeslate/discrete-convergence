// TRACED: AE-FE-008 — Settings page

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tenant Configuration</CardTitle>
          <CardDescription>Manage your organization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant-name">Organization Name</Label>
            <Input id="tenant-name" defaultValue="My Organization" readOnly />
          </div>
          <div className="space-y-2">
            <Label>Current Tier</Label>
            <div>
              <Badge>FREE</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
