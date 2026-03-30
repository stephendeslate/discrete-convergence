import { registerAction } from '../../lib/actions';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Register</h1>
      <form action={registerAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--input)] px-3 py-2" />
        </div>
        <input type="hidden" name="tenantId" value="default-tenant" />
        <button type="submit" className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)]">Register</button>
      </form>
    </div>
  );
}
