import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No customers to display.</p>
        </CardContent>
      </Card>
    </div>
  );
}
