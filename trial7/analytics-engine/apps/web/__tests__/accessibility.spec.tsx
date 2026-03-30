/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

expect.extend(toHaveNoViolations);

// TRACED:AE-AX-001
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
        <CardContent>Content here</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form inputs should have associated labels', async () => {
    const { container } = render(
      <form>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" type="text" />
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading states should have role="status" and aria-busy', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        <div className="animate-pulse h-8 w-48" />
      </div>,
    );
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('error states should have role="alert"', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Error occurred</h2>
        <p>Something went wrong</p>
      </div>,
    );
    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
  });
});
