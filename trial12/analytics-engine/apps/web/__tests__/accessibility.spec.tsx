import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import SettingsPage from '../app/settings/page';

// TRACED: AE-AX-003

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('@analytics-engine/shared', () => ({
  APP_VERSION: '1.0.0',
}));

describe('Accessibility Tests', () => {
  it('should have no axe violations on login page', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no axe violations on register page', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no axe violations on settings page', async () => {
    const { container } = render(await SettingsPage());
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper labels for login form inputs', () => {
    const { getByLabelText } = render(<LoginPage />);
    expect(getByLabelText('Email')).toBeDefined();
    expect(getByLabelText('Password')).toBeDefined();
  });

  it('should have proper labels for register form inputs', () => {
    const { getByLabelText } = render(<RegisterPage />);
    expect(getByLabelText('Name')).toBeDefined();
    expect(getByLabelText('Email')).toBeDefined();
    expect(getByLabelText('Password')).toBeDefined();
  });
});
