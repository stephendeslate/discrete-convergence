/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

expect.extend(toHaveNoViolations);

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock server actions
jest.mock('../lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
  getDashboards: jest.fn().mockResolvedValue({ data: [], total: 0 }),
}));

describe('Accessibility Tests', () => {
  describe('LoginPage', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<LoginPage />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(container.querySelector('form')).toBeTruthy();
    });

    it('should have labeled form inputs', () => {
      const { container } = render(<LoginPage />);
      const labels = container.querySelectorAll('label');
      const inputs = container.querySelectorAll('input');

      expect(labels.length).toBeGreaterThanOrEqual(2);
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should have required aria attributes on inputs', () => {
      const { container } = render(<LoginPage />);
      const emailInput = container.querySelector('input[name="email"]');
      const passwordInput = container.querySelector('input[name="password"]');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(emailInput?.getAttribute('aria-required')).toBe('true');
    });
  });

  describe('RegisterPage', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<RegisterPage />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(container.querySelector('form')).toBeTruthy();
    });

    it('should have all required form labels', () => {
      const { container } = render(<RegisterPage />);
      const labels = container.querySelectorAll('label');

      expect(labels.length).toBeGreaterThanOrEqual(3);
      expect(container.querySelector('input[name="name"]')).toBeTruthy();
    });
  });

  describe('UI Components', () => {
    it('Button should be accessible', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(container.querySelector('button')).toBeTruthy();
    });

    it('Input should be accessible with label', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" type="text" />
        </div>,
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(container.querySelector('input')).toBeTruthy();
    });

    it('Card should render without violations', async () => {
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
      expect(container.querySelector('h3')).toBeTruthy();
    });

    it('Alert should have role="alert"', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>,
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
      expect(container.querySelector('[role="alert"]')).toBeTruthy();
    });
  });
});
