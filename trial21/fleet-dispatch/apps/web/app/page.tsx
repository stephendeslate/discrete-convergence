import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>Fleet Dispatch</h1>
      <p>Multi-tenant field service dispatch platform</p>
      <nav aria-label="Main navigation">
        <ul>
          <li>
            <Link href="/login">Login</Link>
          </li>
          <li>
            <Link href="/register">Register</Link>
          </li>
          <li>
            <Link href="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
