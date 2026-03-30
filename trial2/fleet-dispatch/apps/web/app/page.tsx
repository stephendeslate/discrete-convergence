import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Fleet Dispatch</h1>
        <p className="text-lg text-[var(--muted-foreground)]">
          Multi-tenant field service dispatch platform
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispatch</CardTitle>
            <CardDescription>Manage work orders and assign technicians</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Open Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
            <CardDescription>Track availability and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/technicians">
              <Button variant="outline" className="w-full">View Technicians</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Generate and manage invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/invoices">
              <Button variant="outline" className="w-full">View Invoices</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
