// TRACED:WEB-COMP-WIDGETFORM — Create widget form component
'use client';

import { useState, type FormEvent } from 'react';
import { createWidget } from '../lib/actions';

interface CreateWidgetFormProps {
  token: string;
}

export function CreateWidgetForm({ token }: CreateWidgetFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('chart');
  const [dashboardId, setDashboardId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('type', type);
    formData.set('dashboardId', dashboardId);
    formData.set('token', token);

    const result = await createWidget(formData);
    if (result.success) {
      setTitle('');
      setDashboardId('');
      setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error ?? 'Failed to create widget');
    }
    setLoading(false);
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        New Widget
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      {error && <div role="alert" className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">{error}</div>}
      <div>
        <label htmlFor="widget-title" className="block text-sm font-medium mb-1">Title</label>
        <input id="widget-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
      </div>
      <div>
        <label htmlFor="widget-type" className="block text-sm font-medium mb-1">Type</label>
        <select id="widget-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
          <option value="chart">Chart</option>
          <option value="table">Table</option>
          <option value="metric">Metric</option>
          <option value="map">Map</option>
        </select>
      </div>
      <div>
        <label htmlFor="widget-dash" className="block text-sm font-medium mb-1">Dashboard ID</label>
        <input id="widget-dash" name="dashboardId" value={dashboardId} onChange={(e) => setDashboardId(e.target.value)} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
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
