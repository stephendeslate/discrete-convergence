// TRACED:FD-WEB-019 — Dispatches domain page
import NavBar from '@/components/nav-bar';
import DispatchList from '@/components/dispatch-list';
import CreateDispatchForm from '@/components/create-dispatch-form';

export default function DispatchesPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dispatches</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DispatchList />
          </div>
          <div>
            <CreateDispatchForm />
          </div>
        </div>
      </main>
    </div>
  );
}
