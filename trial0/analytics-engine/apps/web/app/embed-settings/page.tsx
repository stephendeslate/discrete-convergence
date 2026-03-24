import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function EmbedSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Embed Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Embed Configuration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="origins">Allowed Origins</Label>
            <Input id="origins" placeholder="https://example.com" />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="enabled" />
            <Label htmlFor="enabled">Enable Embedding</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
