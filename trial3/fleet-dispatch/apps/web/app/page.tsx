import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Fleet Dispatch</h1>
        <p className="mt-4 text-lg text-gray-600">
          Multi-tenant field service dispatch platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch</CardTitle>
            <CardDescription>
              Manage work orders and assign technicians
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
            <CardDescription>
              Track technician availability and routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/technicians">
              <Button variant="outline">View Technicians</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoicing</CardTitle>
            <CardDescription>
              Generate and manage customer invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/invoices">
              <Button variant="outline">View Invoices</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
