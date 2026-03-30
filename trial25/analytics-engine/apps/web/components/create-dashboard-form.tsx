// TRACED:WEB-COMP-DASHFORM — Create dashboard form component
// TRACED:FE-FORM-COMPONENTS — form components: dashboard, data-source, widget (VERIFY:FE-FORM-COMPONENTS)
'use client';

import { useState, type FormEvent } from 'react';
import { createDashboard } from '../lib/actions';

interface CreateDashboardFormProps {
  token: string;
}

export function CreateDashboardForm({ token }: CreateDashboardFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.set('name', name);
    formData.set('description', description);
    formData.set('token', token);

    const result = await createDashboard(formData);
    if (result.success) {
      setName('');
      setDescription('');
      setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error ?? 'Failed to create dashboard');
    }
    setLoading(false);
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        New Dashboard
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      {error && <div role="alert" className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">{error}</div>}
      <div>
        <label htmlFor="dash-name" className="block text-sm font-medium mb-1">Name</label>
        <input id="dash-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
      </div>
      <div>
        <label htmlFor="dash-desc" className="block text-sm font-medium mb-1">Description</label>
        <input id="dash-desc" name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
