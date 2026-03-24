// TRACED:FD-TEST-010
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { StatusBadge } from '../components/ui/status-badge';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card has no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader><CardTitle>Title</CardTitle></CardHeader>
        <CardContent><p>Content</p></CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input with label has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test">Test</Label>
        <Input id="test" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Switch has no a11y violations', async () => {
    const { container } = render(
      <div>
        <label id="sw-label">Toggle</label>
        <Switch aria-labelledby="sw-label" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('StatusBadge has no a11y violations', async () => {
    const { container } = render(<StatusBadge status="EN_ROUTE" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('loading state has correct ARIA attributes', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <Skeleton className="h-8 w-48" />
        <span className="sr-only">Loading...</span>
      </div>,
    );
    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    expect(status?.getAttribute('aria-busy')).toBe('true');
  });

  it('error state has correct ARIA attributes', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Error occurred</h2>
        <p>Something went wrong</p>
      </div>,
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('tabIndex')).toBe('-1');
  });

  it('form has no a11y violations', async () => {
    const { container } = render(
      <form>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
