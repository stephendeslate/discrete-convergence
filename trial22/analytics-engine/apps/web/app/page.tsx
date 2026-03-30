import { APP_VERSION } from '@repo/shared';

// TRACED: AE-FE-002
export default function HomePage() {
  return (
    <main>
      <h1>Analytics Engine</h1>
      <p>Multi-tenant embeddable analytics platform v{APP_VERSION}</p>
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/login">Login</a></li>
          <li><a href="/register">Register</a></li>
          <li><a href="/dashboard">Dashboards</a></li>
          <li><a href="/data-sources">Data Sources</a></li>
          <li><a href="/settings">Settings</a></li>
        </ul>
      </nav>
    </main>
  );
}
