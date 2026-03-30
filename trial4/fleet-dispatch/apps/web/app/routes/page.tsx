import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function RoutesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Routes</h1>
      <Card>
        <CardHeader><CardTitle>Routes Overview</CardTitle></CardHeader>
        <CardContent><p>Routes content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
