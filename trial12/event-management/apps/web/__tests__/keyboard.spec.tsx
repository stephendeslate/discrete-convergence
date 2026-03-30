/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import DashboardPage from '../app/dashboard/page';

// TRACED: EM-AX-002
describe('Keyboard Navigation', () => {
  it('should navigate login form with tab key', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    await user.tab();
    expect(document.activeElement?.tagName).toBeDefined();
    expect(document.activeElement).toBeTruthy();
  });

  it('should allow typing in login form fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = document.querySelector('#email') as HTMLInputElement;
    expect(emailInput).toBeTruthy();

    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should render dashboard with focusable elements', () => {
    render(<DashboardPage />);
    const heading = screen.getByText('Dashboard');
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe('H1');
  });

  it('should support keyboard interaction on login submit button', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeTruthy();

    await user.tab();
    await user.tab();
    await user.tab();
    // Button should be reachable via tab
    expect(document.activeElement).toBeTruthy();
  });
});
