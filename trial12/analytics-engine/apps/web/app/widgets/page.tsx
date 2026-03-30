import { getWidgets } from '@/lib/actions';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default async function WidgetsPage() {
  const data = await getWidgets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Widgets</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items?.map(
          (widget: { id: string; name: string; type: string }) => (
            <Card key={widget.id}>
              <h3 className="text-lg font-semibold">{widget.name}</h3>
              <Badge>{widget.type}</Badge>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
