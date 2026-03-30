import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="py-12">
      <h1 className="mb-4 text-3xl font-bold">Fleet Dispatch</h1>
      <p className="mb-8 text-gray-600">
        Fleet management and vehicle dispatch platform.
      </p>
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/login"
          className="rounded border px-4 py-2 hover:bg-gray-50"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
