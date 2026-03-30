import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">Analytics Engine</h1>
      <p className="text-lg text-gray-600 mb-8">
        Multi-tenant analytics dashboard platform
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard">
          <Button>View Dashboards</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </div>
  );
}
