import type { BadgeProps } from './ui/badge';
import { Badge } from './ui/badge';

const STATUS_VARIANTS: Record<string, BadgeProps['variant']> = {
  AVAILABLE: 'success',
  IN_TRANSIT: 'warning',
  MAINTENANCE: 'destructive',
  RETIRED: 'outline',
  PENDING: 'outline',
  ASSIGNED: 'default',
  DELIVERED: 'success',
  FAILED: 'destructive',
};

export function StatusBadge({ status }: { status: string }): React.JSX.Element {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'outline'}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
