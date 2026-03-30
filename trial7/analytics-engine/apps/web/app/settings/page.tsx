import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings page content.</p>
        </CardContent>
      </Card>
    </div>
  );
}
