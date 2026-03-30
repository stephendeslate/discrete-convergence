// TRACED: FD-FI-002
import { loginAction } from '@/lib/actions';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form action={loginAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-[var(--border)] rounded bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded hover:opacity-90"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
