import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface WidgetData {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
}

interface WidgetRendererProps {
  widget: WidgetData;
}

const typeLabels: Record<string, string> = {
  LINE: 'Line Chart',
  BAR: 'Bar Chart',
  PIE: 'Pie Chart',
  AREA: 'Area Chart',
  KPI: 'KPI',
  TABLE: 'Table',
  FUNNEL: 'Funnel',
};

export function WidgetRenderer({ widget }: WidgetRendererProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{widget.title}</CardTitle>
          <Badge variant="outline">{typeLabels[widget.type] ?? widget.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            {typeLabels[widget.type] ?? widget.type} visualization
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
