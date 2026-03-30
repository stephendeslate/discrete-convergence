// TRACED:EM-FE-006
export function Nav(): React.ReactElement {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-xl font-bold">EventMgr</a>
        <div className="flex gap-4 items-center">
          <a href="/events" className="hover:underline">Events</a>
          <a href="/venues" className="hover:underline">Venues</a>
          <a href="/dashboard" className="hover:underline">Dashboard</a>
          <a href="/login" className="hover:underline">Login</a>
        </div>
      </div>
    </nav>
  );
}
