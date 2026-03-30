/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import DashboardPage from '../app/dashboard/page';
import LoginPage from '../app/login/page';

// TRACED: EM-AX-001
describe('Accessibility', () => {
  it('should have no accessibility violations on dashboard', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeTruthy();
  });

  it('should have no accessibility violations on login page', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('form')).toBeTruthy();
  });

  it('should have proper form labels on login', () => {
    const { container } = render(<LoginPage />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBeGreaterThanOrEqual(2);
    expect(labels[0].getAttribute('for')).toBeTruthy();
  });

  it('should have proper heading hierarchy on dashboard', () => {
    const { container } = render(<DashboardPage />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Dashboard');
  });
});
