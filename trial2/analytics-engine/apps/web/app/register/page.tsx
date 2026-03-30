export default function RegisterPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
            <input id="name" name="name" type="text" required className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="tenantName" className="block text-sm font-medium mb-1">Organization Name</label>
            <input id="tenantName" name="tenantName" type="text" required className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
