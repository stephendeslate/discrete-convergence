/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from '../app/dashboard/page';
import DashboardLoading from '../app/dashboard/loading';
import SettingsPage from '../app/settings/page';
import { Nav } from '../components/nav';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

expect.extend(toHaveNoViolations);

// Mock next/link for jsdom
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock @fleet-dispatch/shared
jest.mock('@fleet-dispatch/shared', () => ({
  APP_VERSION: '1.0.0',
}));

describe('Accessibility — axe audit', () => {
  it('DashboardPage has no a11y violations', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('DashboardLoading has no a11y violations', async () => {
    const { container } = render(<DashboardLoading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('SettingsPage has no a11y violations', async () => {
    const { container } = render(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Nav has no a11y violations', async () => {
    const { container } = render(<Nav />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button component has no a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Alert component has no a11y violations', async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Card component has no a11y violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content here</CardContent>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with Label has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" placeholder="Enter text" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Badge component has no a11y violations', async () => {
    const { container } = render(<Badge>Active</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading states have role="status" and aria-busy', () => {
    const { container } = render(<DashboardLoading />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('loading states include sr-only text', () => {
    const { container } = render(<DashboardLoading />);
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toContain('Loading');
  });

  it('dashboard page has proper heading hierarchy', () => {
    const { container } = render(<DashboardPage />);
    const h1 = container.querySelector('h1');
    const h2s = container.querySelectorAll('h2');
    expect(h1).not.toBeNull();
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('dashboard regions have aria-label', () => {
    const { container } = render(<DashboardPage />);
    const regions = container.querySelectorAll('[role="region"]');
    expect(regions.length).toBe(3);
    regions.forEach((region) => {
      expect(region.getAttribute('aria-label')).toBeTruthy();
    });
  });
});
