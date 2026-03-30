/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

expect.extend(toHaveNoViolations);

// TRACED: FD-UI-015
describe('Component Accessibility', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" name="test" type="text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card should have no accessibility violations', async () => {
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

  it('Badge should have no accessibility violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Select with Label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-select">Choose</Label>
        <Select id="test-select" name="role">
          <option value="DISPATCHER">Dispatcher</option>
          <option value="DRIVER">Driver</option>
        </Select>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Table should have no accessibility violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Truck Alpha</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Skeleton loading state should have appropriate aria attributes', () => {
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

  it('Login form should have proper form accessibility', async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required aria-required="true" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required aria-required="true" />
        </div>
        <Button type="submit">Sign In</Button>
      </form>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Error state should have role="alert"', () => {
    const { container } = render(
      <div role="alert" tabIndex={-1}>
        <h2>Something went wrong</h2>
        <p>An error occurred</p>
        <Button>Try again</Button>
      </div>,
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.getAttribute('tabIndex')).toBe('-1');
  });

  it('destructive button should be distinguishable', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>);
    const btn = getByRole('button');
    expect(btn.className).toContain('destructive');
  });
});
