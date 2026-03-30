import dynamic from 'next/dynamic';
import { Skeleton } from '../components/ui/skeleton';

const HeroSection = dynamic(() => import('../components/hero-section'), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

// TRACED:EM-FE-005
export default function HomePage(): React.ReactElement {
  return (
    <div>
      <HeroSection />
    </div>
  );
}
