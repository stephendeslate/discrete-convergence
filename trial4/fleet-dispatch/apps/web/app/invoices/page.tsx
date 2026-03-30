import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function InvoicesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Invoices</h1>
      <Card>
        <CardHeader><CardTitle>Invoices Overview</CardTitle></CardHeader>
        <CardContent><p>Invoices content will appear here.</p></CardContent>
      </Card>
    </div>
  );
}
