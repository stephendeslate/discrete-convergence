/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle } from '../components/ui/alert';

expect.extend(toHaveNoViolations);

// TRACED: FD-A11Y-001
describe('Accessibility Tests', () => {
  it('Button should have no axe violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('button')).toBeTruthy();
  });

  it('Input should have no axe violations when labelled', async () => {
    const { container } = render(
      <div>
        <label htmlFor="test-input">Test</label>
        <Input id="test-input" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('input')).toBeTruthy();
  });

  it('Card should have no axe violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.textContent).toContain('Test Card');
  });

  it('Badge should have no axe violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.textContent).toContain('Active');
  });

  it('Alert should have no axe violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <p>This is an alert</p>
      </Alert>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });
});
