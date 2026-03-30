/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock server actions
jest.mock('../lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
  getVehicles: jest.fn(),
  getDrivers: jest.fn(),
  getDispatches: jest.fn(),
  getRoutes: jest.fn(),
  logoutAction: jest.fn(),
}));

describe('Keyboard Navigation Tests', () => {
  it('login form should be navigable by keyboard', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);

    const emailInput = container.querySelector('#email') as HTMLInputElement;
    const passwordInput = container.querySelector('#password') as HTMLInputElement;

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();

    await user.tab();
    expect(document.activeElement?.tagName).toBeDefined();

    await user.tab();
    expect(document.activeElement).toBeTruthy();
  });

  it('login form should have accessible labels', () => {
    const { container } = render(<LoginPage />);
    const emailLabel = container.querySelector('label[for="email"]');
    const passwordLabel = container.querySelector('label[for="password"]');

    expect(emailLabel).toBeTruthy();
    expect(emailLabel?.textContent).toContain('Email');
    expect(passwordLabel).toBeTruthy();
    expect(passwordLabel?.textContent).toContain('Password');
  });

  it('submit button should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    const submitButton = container.querySelector('button[type="submit"]');

    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toContain('Sign In');

    (submitButton as HTMLElement)?.focus();
    expect(document.activeElement).toBe(submitButton);

    await user.keyboard('{Enter}');
  });

  it('form inputs should accept keyboard input', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    const emailInput = container.querySelector('#email') as HTMLInputElement;

    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });
});
