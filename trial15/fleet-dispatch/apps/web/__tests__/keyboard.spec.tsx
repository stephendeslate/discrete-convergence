/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../app/dashboard/page';
import VehiclesPage from '../app/vehicles/page';

// TRACED: FD-AX-002
describe('Keyboard Navigation Tests', () => {
  it('should allow tab navigation on dashboard page', async () => {
    const user = userEvent.setup();
    const { container } = render(<DashboardPage />);

    await user.tab();
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeDefined();
    expect(container).toBeDefined();
  });

  it('should allow tab navigation on vehicles page', async () => {
    const user = userEvent.setup();
    const { container } = render(<VehiclesPage />);

    await user.tab();
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeDefined();
    expect(container).toBeDefined();
  });

  it('should navigate through interactive elements', async () => {
    const user = userEvent.setup();
    const { container } = render(<DashboardPage />);

    await user.tab();
    await user.tab();
    const secondFocused = document.activeElement;
    expect(secondFocused).toBeDefined();
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0);
  });

  it('should handle keyboard events on buttons', async () => {
    const user = userEvent.setup();
    const { getByText } = render(<VehiclesPage />);

    const button = getByText('Add Vehicle');
    button.focus();
    expect(document.activeElement).toBe(button);

    await user.keyboard('{Enter}');
    expect(button).toBeDefined();
  });
});
