import { Button } from './ui/button';

export default function HeroSection(): React.ReactElement {
  return (
    <section className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Event Management Platform</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-8">
        Plan, organize, and manage your events with ease.
      </p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <a href="/events">Browse Events</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/register">Get Started</a>
        </Button>
      </div>
    </section>
  );
}
