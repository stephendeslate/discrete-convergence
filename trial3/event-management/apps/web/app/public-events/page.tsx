import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PublicEventsPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Discover Events</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Find upcoming events and register
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tech Conference 2026</CardTitle>
              <Badge>Open</Badge>
            </div>
            <CardDescription>June 15-17, 2026 at Convention Center</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Annual technology conference with workshops and talks
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Register Now</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
