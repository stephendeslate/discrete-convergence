// TRACED:FD-WEB-018 — Routes domain page
import NavBar from '@/components/nav-bar';
import RouteList from '@/components/route-list';

export default function RoutesPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Routes</h1>
        <RouteList />
      </main>
    </div>
  );
}
