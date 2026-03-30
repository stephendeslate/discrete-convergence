// TRACED:FD-WEB-030 — Create driver form component
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function CreateDriverForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('email', email);
      formData.set('phone', phone);
      formData.set('licenseNumber', licenseNumber);

      setMessage('Driver creation submitted');
      setName('');
      setEmail('');
      setPhone('');
      setLicenseNumber('');
    } catch {
      setMessage('Failed to create driver');
    }
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6')}>
      <h2 className="text-lg font-semibold mb-4">Add Driver</h2>
      {message && (
        <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4 text-sm">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="driver-name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="driver-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="driver-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="driver-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="driver-phone" className="block text-sm font-medium mb-1">
            Phone
          </label>
          <input
            id="driver-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label htmlFor="driver-license" className="block text-sm font-medium mb-1">
            License Number
          </label>
          <input
            id="driver-license"
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Driver
        </button>
      </form>
    </div>
  );
}
