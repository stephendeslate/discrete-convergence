'use client';

import { Badge } from '@/components/ui/badge';

export default function DashboardStats() {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">System Status</h2>
      <div className="mt-2 flex gap-2">
        <Badge variant="success">API Online</Badge>
        <Badge variant="default">Database Connected</Badge>
      </div>
    </div>
  );
}
