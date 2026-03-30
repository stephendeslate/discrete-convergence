import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import SettingsPage from '../app/settings/page';

describe('Accessibility', () => {
  it('login page should have no a11y violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('register page should have no a11y violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('settings page should have no a11y violations', async () => {
    const { container } = render(<SettingsPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
