// TRACED: EM-FE-009 — Home page redirects to dashboard
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
