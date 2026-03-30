/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardPage from '../app/dashboard/page';
import VehiclesPage from '../app/vehicles/page';

expect.extend(toHaveNoViolations);

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Accessibility Tests', () => {
  it('dashboard page should have no accessibility violations', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('vehicles page should have no accessibility violations', async () => {
    const { container } = render(<VehiclesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('dashboard page should have proper heading hierarchy', () => {
    const { container } = render(<DashboardPage />);
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent).toContain('Dashboard');
  });

  it('vehicles page should have table with proper role', () => {
    const { container } = render(<VehiclesPage />);
    const table = container.querySelector('[role="table"]');
    expect(table).toBeTruthy();
  });
});
