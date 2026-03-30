import { Nav } from '@/components/nav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </>
  );
}
