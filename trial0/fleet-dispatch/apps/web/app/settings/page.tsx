'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [gpsTracking, setGpsTracking] = useState(true);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Demo Fleet Co" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="America/New_York" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="gps">GPS Tracking</Label>
              <Switch id="gps" checked={gpsTracking} onCheckedChange={setGpsTracking} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoDispatch">Auto-Dispatch</Label>
              <Switch id="autoDispatch" checked={autoDispatch} onCheckedChange={setAutoDispatch} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif">Email Notifications</Label>
              <Switch id="notif" checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
