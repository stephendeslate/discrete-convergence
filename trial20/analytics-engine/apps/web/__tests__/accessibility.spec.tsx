/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

expect.extend(toHaveNoViolations);

// TRACED: AE-A11Y-001 — Accessibility tests using jest-axe on real components
describe('Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card with content should have no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" type="text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton loading state should have no a11y violations', async () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <Skeleton className="h-8 w-32" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('form with proper labels should have no a11y violations', async () => {
    const { container } = render(
      <form aria-label="Test form">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required aria-required="true" />
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required aria-required="true" />
        <Button type="submit">Submit</Button>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
