// TRACED:EM-FE-005
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { SessionList } from '../../components/session-list';

export default async function SessionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let sessions: Array<{ id: string; title: string; status: string; startTime: string }> = [];
  try {
    const res = await apiClient<{ data: typeof sessions }>('/sessions', { token });
    sessions = res.data ?? [];
  } catch {
    sessions = [];
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Sessions</h1>
      <SessionList sessions={sessions} />
    </div>
  );
}
