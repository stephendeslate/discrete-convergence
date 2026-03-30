import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dispatch Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Active Orders</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <Badge>Live</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Technicians Online</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">5</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pending Invoices</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">3</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
