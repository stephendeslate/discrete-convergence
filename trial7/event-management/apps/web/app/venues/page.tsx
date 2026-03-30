import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

export default function VenuesPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Venues</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Main Hall</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">123 Event St, Eventville</p>
            <p>Capacity: 500</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
