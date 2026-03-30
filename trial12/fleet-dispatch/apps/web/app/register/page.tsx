import { registerAction } from '@/lib/actions';

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form action={registerAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input id="name" name="name" type="text" required className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input id="email" name="email" type="email" required className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input id="password" name="password" type="password" required className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
          <select id="role" name="role" required className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]">
            <option value="DRIVER">Driver</option>
            <option value="DISPATCHER">Dispatcher</option>
          </select>
        </div>
        <input type="hidden" name="tenantId" value="550e8400-e29b-41d4-a716-446655440000" />
        <button type="submit" className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90">
          Register
        </button>
      </form>
    </div>
  );
}
