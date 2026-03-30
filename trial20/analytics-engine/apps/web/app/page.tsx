import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// TRACED: AE-FE-003 — Home page with navigation to key features
export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Analytics Engine</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Multi-tenant analytics dashboard platform
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Create and manage analytics dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/dashboard">
              <Button>View Dashboards</Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Connect and configure data sources</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/data-sources">
              <Button variant="secondary">Manage Sources</Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your account and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/settings">
              <Button variant="outline">Settings</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
