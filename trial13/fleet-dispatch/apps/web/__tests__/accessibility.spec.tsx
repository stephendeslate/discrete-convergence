/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import DashboardPage from '../app/dashboard/page';
import VehiclesPage from '../app/vehicles/page';
import DriversPage from '../app/drivers/page';
import DispatchesPage from '../app/dispatches/page';
import RoutesPage from '../app/routes/page';

// TRACED: FD-AX-001
describe('Accessibility Tests', () => {
  it('should have no a11y violations on dashboard page', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeDefined();
  });

  it('should have no a11y violations on vehicles page', async () => {
    const { container } = render(<VehiclesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeDefined();
  });

  it('should have no a11y violations on drivers page', async () => {
    const { container } = render(<DriversPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeDefined();
  });

  it('should have no a11y violations on dispatches page', async () => {
    const { container } = render(<DispatchesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeDefined();
  });

  it('should have no a11y violations on routes page', async () => {
    const { container } = render(<RoutesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    expect(container.querySelector('h1')).toBeDefined();
  });
});
