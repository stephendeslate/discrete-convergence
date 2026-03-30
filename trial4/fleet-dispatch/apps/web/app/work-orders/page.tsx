import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function WorkOrdersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Work Orders</h1>
      <Card>
        <CardHeader><CardTitle>Work Orders Overview</CardTitle></CardHeader>
        <CardContent><p>Work Orders content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
