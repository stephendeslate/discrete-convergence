/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginPage from '../app/login/page';
import SettingsPage from '../app/settings/page';

expect.extend(toHaveNoViolations);

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock server actions
jest.mock('../lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
  getDashboards: jest.fn().mockResolvedValue({ data: [] }),
  getDataSources: jest.fn().mockResolvedValue({ data: [] }),
  getWidgets: jest.fn().mockResolvedValue({ data: [] }),
  reportError: jest.fn(),
}));

describe('Accessibility Tests', () => {
  it('should have no axe violations on login page', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('form')).not.toBeNull();
  });

  it('should have accessible form labels on login page', () => {
    const { getByLabelText } = render(<LoginPage />);
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
  });

  it('should have no axe violations on settings page', async () => {
    const { container } = render(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('should have proper heading hierarchy', () => {
    const { container } = render(<SettingsPage />);
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe('Settings');
  });

  it('loading states should have role=status and aria-busy', () => {
    // Verify the pattern exists in loading components
    const DashboardLoading = require('../app/dashboard/loading').default;
    const { container } = render(<DashboardLoading />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('error states should have role=alert', () => {
    const DashboardError = require('../app/dashboard/error').default;
    const { container } = render(
      <DashboardError error={new Error('Test')} reset={jest.fn()} />,
    );
    const alertEl = container.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
    expect(alertEl?.getAttribute('tabindex')).toBe('-1');
  });
});
