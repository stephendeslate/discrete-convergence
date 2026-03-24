import { Badge } from './badge';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  UNASSIGNED: 'outline',
  ASSIGNED: 'secondary',
  EN_ROUTE: 'warning',
  ON_SITE: 'warning',
  IN_PROGRESS: 'default',
  COMPLETED: 'success',
  INVOICED: 'success',
  PAID: 'success',
  CANCELLED: 'destructive',
  DRAFT: 'outline',
  SENT: 'default',
  VOID: 'destructive',
  AVAILABLE: 'success',
  BUSY: 'warning',
  OFF_DUTY: 'secondary',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? 'outline';
  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
