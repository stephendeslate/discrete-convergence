import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Settings Overview</CardTitle></CardHeader>
        <CardContent><p>Settings content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
