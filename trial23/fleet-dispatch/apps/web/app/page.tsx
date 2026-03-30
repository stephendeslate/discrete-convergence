export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fleet Dispatch</h1>
      <p className="text-gray-600">Multi-tenant field service dispatch management platform.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/work-orders" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h2 className="text-xl font-semibold">Work Orders</h2>
          <p className="text-gray-500 mt-2">Manage and track field service work orders</p>
        </a>
        <a href="/technicians" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h2 className="text-xl font-semibold">Technicians</h2>
          <p className="text-gray-500 mt-2">Manage technician profiles and availability</p>
        </a>
        <a href="/routes" className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
          <h2 className="text-xl font-semibold">Routes</h2>
          <p className="text-gray-500 mt-2">Plan and optimize service routes</p>
        </a>
      </div>
    </div>
  );
}
