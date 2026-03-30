// TRACED:EM-FE-005
import { cookies } from 'next/headers';
import { apiClient } from '../../lib/api';
import { SpeakerList } from '../../components/speaker-list';

export default async function SpeakersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let speakers: Array<{ id: string; name: string; email: string; bio?: string }> = [];
  try {
    const res = await apiClient<{ data: typeof speakers }>('/speakers', { token });
    speakers = res.data ?? [];
  } catch {
    speakers = [];
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold dark:text-white">Speakers</h1>
      <SpeakerList speakers={speakers} />
    </div>
  );
}
