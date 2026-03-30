import { getTechnicians } from '@/lib/actions';

export default async function TechniciansPage() {
  const technicians = await getTechnicians();

  return (
    <main>
      <h1>Technicians</h1>
      <section aria-label="Technician list">
        <h2>All Technicians ({technicians.total})</h2>
        <table aria-label="Technician table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Skills</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {technicians.data.map((tech: { id: string; firstName: string; lastName: string; email: string; skills: string[]; isActive: boolean }) => (
              <tr key={tech.id}>
                <td>{tech.firstName} {tech.lastName}</td>
                <td>{tech.email}</td>
                <td>{tech.skills.join(', ')}</td>
                <td>{tech.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
