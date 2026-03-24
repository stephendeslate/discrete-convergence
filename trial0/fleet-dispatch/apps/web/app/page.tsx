import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Active Work Orders', value: '—' },
  { label: 'Technicians On Duty', value: '—' },
  { label: 'Pending Invoices', value: '—' },
  { label: 'Completed Today', value: '—' },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
