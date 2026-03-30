import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function CustomersPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Customers</h1>
      <Card>
        <CardHeader><CardTitle>Customers Overview</CardTitle></CardHeader>
        <CardContent><p>Customers content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
