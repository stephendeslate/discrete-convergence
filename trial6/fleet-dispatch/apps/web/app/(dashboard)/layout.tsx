import { Nav } from '@/components/nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
