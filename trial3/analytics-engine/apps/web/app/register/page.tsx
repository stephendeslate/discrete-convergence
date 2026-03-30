import { registerAction } from '../../lib/actions';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form action={registerAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--input)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--input)] px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="tenantName" className="block text-sm font-medium mb-1">
            Organization Name
          </label>
          <input
            id="tenantName"
            name="tenantName"
            type="text"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--input)] px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)] hover:opacity-90"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
