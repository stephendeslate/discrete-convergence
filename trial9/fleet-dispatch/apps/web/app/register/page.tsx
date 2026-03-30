import { registerAction } from '@/lib/actions';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-6">Register</h1>
      <form action={registerAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">Name</label>
          <input id="name" name="name" type="text" required className="mt-1 block w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 block w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)]">Password</label>
          <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-[var(--foreground)]">Role</label>
          <select id="role" name="role" required className="mt-1 block w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm">
            <option value="DRIVER">Driver</option>
            <option value="DISPATCHER">Dispatcher</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>
        <input type="hidden" name="tenantId" value="default-tenant" />
        <button type="submit" className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90">
          Register
        </button>
      </form>
    </div>
  );
}
