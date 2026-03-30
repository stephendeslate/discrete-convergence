import { getWorkOrders } from '@/lib/actions';

export default async function WorkOrdersPage() {
  const { data } = await getWorkOrders();
  const orders = data as Array<{ id: string; title: string; status: string; priority: string }>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Work Orders</h1>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{order.title}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">{order.status}</span></td>
                <td className="px-4 py-3">{order.priority}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No work orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
