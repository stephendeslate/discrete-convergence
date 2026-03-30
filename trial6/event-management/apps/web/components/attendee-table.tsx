// TRACED:EM-FE-006 — Attendee table with check-in status indicators
import { Table } from '@/components/table';
import { Badge } from '@/components/ui/badge';

interface Attendee {
  id: string;
  name: string;
  email: string;
  checkInStatus: string;
}

interface AttendeeTableProps {
  attendees: Attendee[];
  emptyMessage?: string;
}

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  CHECKED_IN: 'success',
  REGISTERED: 'warning',
  NO_SHOW: 'danger',
};

export function AttendeeTable({ attendees, emptyMessage = 'No attendees yet' }: AttendeeTableProps) {
  if (attendees.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <Table>
      <thead>
        <tr className="border-b text-xs uppercase text-gray-500">
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {attendees.map((attendee) => (
          <tr key={attendee.id} className="border-b hover:bg-gray-50">
            <td className="px-4 py-2 font-medium">{attendee.name}</td>
            <td className="px-4 py-2 text-gray-600">{attendee.email}</td>
            <td className="px-4 py-2">
              <Badge variant={statusVariant[attendee.checkInStatus] ?? 'default'}>
                {attendee.checkInStatus.replace('_', ' ')}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
