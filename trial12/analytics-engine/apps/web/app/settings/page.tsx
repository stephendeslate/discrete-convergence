import { Card } from '@/components/ui/Card';
import { APP_VERSION } from '@analytics-engine/shared';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <h2 className="text-lg font-semibold">Application Info</h2>
        <p className="text-[var(--muted-foreground)]">
          Version: {APP_VERSION}
        </p>
      </Card>
    </div>
  );
}
