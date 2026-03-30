import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Fleet Dispatch Management</h1>
        <p className="text-[var(--muted-foreground)] text-lg">
          Manage your fleet vehicles, drivers, and dispatches efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles</CardTitle>
            <CardDescription>Manage your fleet vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vehicles">
              <Button className="w-full">View Vehicles</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
            <CardDescription>Manage your drivers</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/drivers">
              <Button className="w-full">View Drivers</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dispatches</CardTitle>
            <CardDescription>Track active dispatches</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dispatches">
              <Button className="w-full">View Dispatches</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
            <CardDescription>Plan and manage routes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/routes">
              <Button className="w-full">View Routes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
