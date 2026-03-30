import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function TechniciansPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Technicians</h1>
      <Card>
        <CardHeader><CardTitle>Technicians Overview</CardTitle></CardHeader>
        <CardContent><p>Technicians content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
