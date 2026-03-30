/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

describe('Accessibility', () => {
  it('login page should have no accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('register page should have no accessibility violations', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('login page should have form labels', () => {
    const { container } = render(<LoginPage />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });
});
