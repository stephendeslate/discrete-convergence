// TRACED:EM-FE-010
'use client';

import { createVenue } from '../lib/actions';

export function CreateVenueForm() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold dark:text-white">Create Venue</h2>
      <form action={createVenue} className="space-y-4">
        <div>
          <label htmlFor="venue-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
          <input id="venue-name" name="name" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
          <input id="address" name="address" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
          <input id="city" name="city" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        </div>
        <div>
          <label htmlFor="venue-capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacity</label>
          <input id="venue-capacity" name="capacity" type="number" min="1" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900 dark:text-white" />
        </div>
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Create Venue
        </button>
      </form>
    </div>
  );
}
