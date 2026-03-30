import { getTechnicians } from '@/lib/actions';

export default async function TechniciansPage() {
  const { data } = await getTechnicians();
  const technicians = data as Array<{ id: string; user?: { name: string; email: string }; specialties: string[]; isAvailable: boolean }>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech) => (
          <div key={tech.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">{tech.user?.name ?? 'Unknown'}</h3>
            <p className="text-sm text-gray-500">{tech.user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {tech.specialties.map((s) => (
                <span key={s} className="px-2 py-0.5 text-xs bg-gray-100 rounded">{s}</span>
              ))}
            </div>
            <span className={`mt-2 inline-block px-2 py-0.5 text-xs rounded ${tech.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {tech.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        ))}
        {technicians.length === 0 && <p className="text-gray-500">No technicians found</p>}
      </div>
    </div>
  );
}
