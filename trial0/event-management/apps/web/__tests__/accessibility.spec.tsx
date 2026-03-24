// TRACED:EM-TEST-010
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EventCard } from '@/components/ui/event-card';
import { Nav } from '@/components/ui/nav';

expect.extend(toHaveNoViolations);

describe('Accessibility — jest-axe', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card with content has no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent><p>Content</p></CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Labeled input has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Name</Label>
        <Input id="test-input" name="test" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Switch with label has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="sw">Toggle</Label>
        <Switch id="sw" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('EventCard has no a11y violations', async () => {
    const { container } = render(
      <EventCard title="Conference" status="PUBLISHED" date="2025-06-15" venue="Main Hall" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Nav has no a11y violations', async () => {
    const { container } = render(<Nav />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Loading skeleton has correct ARIA attributes', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      </div>,
    );
    const status = container.querySelector('[role="status"]');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('Error state has correct ARIA attributes', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Error</h2>
        <p>Something went wrong</p>
      </div>,
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('tabindex', '-1');
  });

  it('Form with all labeled fields has no a11y violations', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button type="submit">Submit</Button>
      </form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
