import Link from 'next/link';

/**
 * VERIFY: AE-A11Y-002 — heading hierarchy maintained on home page
 */
export default function HomePage() {
  return (
    <main>
      <h1>Analytics Engine</h1>{/* TRACED: AE-A11Y-002 */}
      <p>Multi-tenant embeddable analytics platform</p>
      <nav aria-label="Main navigation">
        <ul>
          <li><Link href="/login">Login</Link></li>
          <li><Link href="/register">Register</Link></li>
          <li><Link href="/dashboard">Dashboards</Link></li>
        </ul>
      </nav>
    </main>
  );
}
