// TRACED:EM-FE-010
'use client';

interface SpeakerItem {
  id: string;
  name: string;
  email: string;
  bio?: string;
}

export function SpeakerList({ speakers = [] }: { speakers?: SpeakerItem[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold dark:text-white">Speakers</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {speakers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
            No speakers found.
          </div>
        ) : (
          speakers.map((speaker) => (
            <div key={speaker.id} className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold dark:text-white">{speaker.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{speaker.email}</p>
              {speaker.bio && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{speaker.bio}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
