// TRACED:EM-FE-001
'use client';

export function NavBar() {
  return (
    <nav aria-label="Main navigation" className="bg-white shadow-sm border-b dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <a href="/events" className="text-xl font-bold text-blue-600 dark:text-blue-400">EventMgr</a>
            <a href="/events" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Events</a>
            <a href="/venues" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Venues</a>
            <a href="/tickets" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Tickets</a>
            <a href="/attendees" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Attendees</a>
            <a href="/speakers" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Speakers</a>
            <a href="/sessions" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Sessions</a>
          </div>
          <a href="/settings" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Settings</a>
        </div>
      </div>
    </nav>
  );
}
