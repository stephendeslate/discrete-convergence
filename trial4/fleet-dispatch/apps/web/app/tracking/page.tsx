import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function TrackingPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tracking</h1>
      <Card>
        <CardHeader><CardTitle>Tracking Overview</CardTitle></CardHeader>
        <CardContent><p>Tracking content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
