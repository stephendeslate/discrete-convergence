// TRACED:WEB-COMP-DSFORM — Create data source form component
'use client';

import { useState, type FormEvent } from 'react';
import { createDataSource } from '../lib/actions';

interface CreateDataSourceFormProps {
  token: string;
}

export function CreateDataSourceForm({ token }: CreateDataSourceFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('postgresql');
  const [connectionString, setConnectionString] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.set('name', name);
    formData.set('type', type);
    formData.set('connectionString', connectionString);
    formData.set('token', token);

    const result = await createDataSource(formData);
    if (result.success) {
      setName('');
      setConnectionString('');
      setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error ?? 'Failed to create data source');
    }
    setLoading(false);
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        New Data Source
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      {error && <div role="alert" className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">{error}</div>}
      <div>
        <label htmlFor="ds-name" className="block text-sm font-medium mb-1">Name</label>
        <input id="ds-name" name="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
      </div>
      <div>
        <label htmlFor="ds-type" className="block text-sm font-medium mb-1">Type</label>
        <select id="ds-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="mongodb">MongoDB</option>
          <option value="rest_api">REST API</option>
          <option value="csv">CSV</option>
        </select>
      </div>
      <div>
        <label htmlFor="ds-conn" className="block text-sm font-medium mb-1">Connection String</label>
        <input id="ds-conn" name="connectionString" value={connectionString} onChange={(e) => setConnectionString(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
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
