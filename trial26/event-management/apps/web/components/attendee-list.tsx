// TRACED:EM-FE-010
'use client';

interface AttendeeItem {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
}

export function AttendeeList({ attendees = [] }: { attendees?: AttendeeItem[] }) {
  if (attendees.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
        <p>No attendees registered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attendees.map((attendee) => (
        <div key={attendee.id} className="rounded-lg border border-gray-200 p-6 flex justify-between items-center dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h3 className="font-semibold dark:text-white">{attendee.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{attendee.email}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            attendee.checkedIn
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {attendee.checkedIn ? 'Checked In' : 'Not Checked In'}
          </span>
        </div>
      ))}
    </div>
  );
}
