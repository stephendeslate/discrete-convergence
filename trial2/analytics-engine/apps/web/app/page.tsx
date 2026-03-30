export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">
        Analytics Engine
      </h1>
      <p className="text-lg text-[var(--muted-foreground)]">
        Multi-tenant embeddable analytics platform. Configure data sources,
        build dashboards, and embed branded analytics into your products.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold mb-2">Dashboards</h2>
          <p className="text-[var(--muted-foreground)]">
            Create and manage analytics dashboards with customizable widgets.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold mb-2">Data Sources</h2>
          <p className="text-[var(--muted-foreground)]">
            Connect REST APIs, databases, CSV files, and webhooks.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold mb-2">Embed</h2>
          <p className="text-[var(--muted-foreground)]">
            White-label analytics with a single script tag.
          </p>
        </div>
      </div>
    </div>
  );
}
