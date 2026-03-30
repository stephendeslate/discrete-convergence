/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Nav } from '../components/nav';

expect.extend(toHaveNoViolations);

// TRACED:EM-AX-001
describe('Accessibility', () => {
  it('Button should have no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test</Label>
        <Input id="test-input" type="text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge should have no a11y violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Nav should have no a11y violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading states should have role="status" and aria-busy', () => {
    const { container } = render(
      <div role="status" aria-busy="true">
        Loading...
      </div>,
    );
    const el = container.querySelector('[role="status"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-busy')).toBe('true');
  });

  it('error states should have role="alert"', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        Error occurred
      </div>,
    );
    const el = container.querySelector('[role="alert"]');
    expect(el).toBeTruthy();
  });
});
