import { loginAction } from '@/lib/actions';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form action={loginAction} className="flex flex-col gap-4">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input)]"
          aria-required="true"
        />
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input)]"
          aria-required="true"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
