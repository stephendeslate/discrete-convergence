'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions';

// TRACED: FD-AUTH-003
export default function SettingsPage() {
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push('/login');
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-[var(--muted-foreground)]">Manage your account settings and preferences.</p>
        <div className="border-t border-[var(--border)] pt-4">
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
