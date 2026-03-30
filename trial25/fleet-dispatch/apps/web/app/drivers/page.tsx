// TRACED:FD-WEB-017 — Drivers domain page
import NavBar from '@/components/nav-bar';
import DriverList from '@/components/driver-list';

export default function DriversPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Drivers</h1>
        <DriverList />
      </main>
    </div>
  );
}
