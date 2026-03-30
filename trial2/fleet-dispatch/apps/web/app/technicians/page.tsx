import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Technicians</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bob Technician</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge>plumbing</Badge>
                <Badge>electrical</Badge>
              </div>
              <Separator />
              <p className="text-sm text-[var(--muted-foreground)]">
                Status: <Badge variant="outline">Available</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alice Field</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Badge>hvac</Badge>
                <Badge>electrical</Badge>
              </div>
              <Separator />
              <p className="text-sm text-[var(--muted-foreground)]">
                Status: <Badge variant="destructive">Unavailable</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
