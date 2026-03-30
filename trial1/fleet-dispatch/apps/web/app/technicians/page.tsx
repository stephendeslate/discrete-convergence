'use client';

import { useState, useEffect } from 'react';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Technician {
  id: string;
  name: string;
  phone?: string;
  skills: string[];
  isActive: boolean;
  latitude?: number;
  longitude?: number;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setTechnicians([]);
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Technicians</h1>
        <Button>Add Technician</Button>
      </div>
      {loading ? (
        <div role="status" aria-busy="true" className="animate-pulse text-muted-foreground">
          Loading technicians...
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Skills</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Location</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech) => (
              <tr key={tech.id} className="border-t border-border">
                <td className="px-4 py-2">{tech.name}</td>
                <td className="px-4 py-2">{tech.phone ?? '—'}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    {tech.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Badge>{tech.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-2">
                  {tech.latitude && tech.longitude
                    ? `${tech.latitude.toFixed(4)}, ${tech.longitude.toFixed(4)}`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
