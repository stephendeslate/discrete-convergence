import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';

expect.extend(toHaveNoViolations);

// TRACED: EM-TEST-010 — Accessibility tests for UI components

describe('Accessibility', () => {
  it('should render Button without accessibility violations', async () => {
    // TRACED: EM-A11Y-001
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    expect(container.querySelector('button')).toBeTruthy();
    expect(container.querySelector('button')?.textContent).toBe('Click me');
  });

  it('should render Card with heading structure without violations', async () => {
    // TRACED: EM-A11Y-002
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
      </Card>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    expect(container.querySelector('h3')?.textContent).toBe('Test Card Title');
    expect(container.textContent).toContain('Card content goes here');
  });

  it('should render Input with associated Label without violations', async () => {
    // TRACED: EM-A11Y-003
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <Input id="test-input" type="email" placeholder="Enter email" />
      </div>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('type')).toBe('email');
    expect(input?.getAttribute('id')).toBe('test-input');
  });

  it('should render Alert with role="alert" without violations', async () => {
    // TRACED: EM-A11Y-004
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>,
    );
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeTruthy();
    expect(alert?.textContent).toContain('Warning');
    expect(alert?.textContent).toContain('Something happened');
  });

  it('should render Badge without violations', async () => {
    // TRACED: EM-A11Y-005
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    expect(container.textContent).toBe('Active');
  });

  it('should render disabled Button with correct attributes', async () => {
    // TRACED: EM-A11Y-006
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);

    expect(results).toHaveNoViolations();
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toBe('Disabled');
  });
});
