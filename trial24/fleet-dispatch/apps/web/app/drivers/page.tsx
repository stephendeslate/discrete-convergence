// TRACED:WEB-DRIVERS-PAGE
import { DriverList } from '@/components/driver-list';
import { CreateDriverForm } from '@/components/create-driver-form';

export default function DriversPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
      </div>
      <CreateDriverForm />
      <DriverList />
    </div>
  );
}
