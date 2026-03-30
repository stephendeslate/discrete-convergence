/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('Input with label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <Input id="test-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('Card component should have no accessibility violations', async () => {
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
    expect(container.querySelector('h3')).toBeTruthy();
  });

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.textContent).toContain('Active');
  });

  it('Alert should have no accessibility violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('Separator should have separator role', () => {
    const { container } = render(<Separator />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator).toBeTruthy();
    expect(separator).not.toBeNull();
  });

  it('Skeleton should render for loading states', () => {
    const { container } = render(<Skeleton className="h-8 w-48" />);
    const skeleton = container.firstElementChild;
    expect(skeleton).toBeTruthy();
    expect(skeleton?.className).toContain('animate-pulse');
  });

  it('Button variants should all be accessible', async () => {
    const { container } = render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelectorAll('button').length).toBe(4);
  });
});
