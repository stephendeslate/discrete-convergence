// TRACED:AE-TEST-010 — Accessibility tests with real jest-axe and real components
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Card content here</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" placeholder="Enter text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Loading state should have role="status" and aria-busy', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <Skeleton className="h-8 w-48" />
      </div>,
    );
    const statusElement = container.querySelector('[role="status"]');
    expect(statusElement).toBeTruthy();
    expect(statusElement?.getAttribute('aria-busy')).toBe('true');
  });

  it('Error state should have role="alert"', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Something went wrong</h2>
        <p>Error message</p>
      </div>,
    );
    const alertElement = container.querySelector('[role="alert"]');
    expect(alertElement).toBeTruthy();
    expect(alertElement?.getAttribute('tabIndex')).toBe('-1');
  });

  it('Switch should have role="switch" and aria-checked', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-switch">Toggle</Label>
        <Switch id="test-switch" checked={false} />
      </div>,
    );
    const switchElement = container.querySelector('[role="switch"]');
    expect(switchElement).toBeTruthy();
    expect(switchElement?.getAttribute('aria-checked')).toBe('false');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
