/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Accessibility — axe audit', () => {
  it('Button has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Card with heading has no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content here</p>
        </CardContent>
      </Card>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Input with Label has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" type="text" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge has no a11y violations', async () => {
    const { container } = render(<Badge>Status</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Separator renders with role=separator', () => {
    render(<Separator />);
    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('Skeleton loading state uses role=status on parent', async () => {
    const { container } = render(
      <div role="status" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-4 w-32" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('error boundary container has role=alert', () => {
    render(
      <div role="alert">
        <h2 tabIndex={-1}>Something went wrong</h2>
        <button type="button">Try again</button>
      </div>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('vertical Separator has correct aria-orientation', () => {
    render(<Separator orientation="vertical" data-testid="vsep" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
  });
});
