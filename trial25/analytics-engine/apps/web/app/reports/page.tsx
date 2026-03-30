// TRACED:WEB-REPORTS — Reports page
import { cookies } from 'next/headers';

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="text-center mt-16">
        <h1 className="text-2xl font-bold mb-4">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view reports.</p>
        <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">No reports generated yet. Create a dashboard and add widgets to generate reports.</p>
      </div>
    </div>
  );
}
