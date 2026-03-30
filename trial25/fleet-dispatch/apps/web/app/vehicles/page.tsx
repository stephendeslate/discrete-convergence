// TRACED:FD-WEB-016 — Vehicles domain page
import NavBar from '@/components/nav-bar';
import VehicleList from '@/components/vehicle-list';
import CreateVehicleForm from '@/components/create-vehicle-form';

export default function VehiclesPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Vehicles</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VehicleList />
          </div>
          <div>
            <CreateVehicleForm />
          </div>
        </div>
      </main>
    </div>
  );
}
