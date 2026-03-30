// TRACED:WEB-VEHICLES-PAGE
import { VehicleList } from '@/components/vehicle-list';
import { CreateVehicleForm } from '@/components/create-vehicle-form';

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
      </div>
      <CreateVehicleForm />
      <VehicleList />
    </div>
  );
}
