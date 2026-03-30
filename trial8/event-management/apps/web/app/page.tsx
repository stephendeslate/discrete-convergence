import { redirect } from 'next/navigation';

// TRACED: EM-UI-002 — Home page redirects to dashboard
export default function HomePage() {
  redirect('/dashboard');
}
