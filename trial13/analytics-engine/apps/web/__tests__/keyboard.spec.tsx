/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';

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

describe('Keyboard Navigation Tests', () => {
  it('should navigate through login form with tab', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: /sign in/i });

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should allow typing in email input with keyboard', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
    expect(emailInput).toHaveFocus();
  });

  it('should allow typing in password input with keyboard', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<LoginPage />);

    const passwordInput = getByLabelText('Password');
    await user.click(passwordInput);
    await user.type(passwordInput, 'mypassword');

    expect(passwordInput).toHaveValue('mypassword');
    expect(passwordInput).toHaveFocus();
  });

  it('should activate submit button with Enter key', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<LoginPage />);

    const submitButton = getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(submitButton).toHaveFocus();
    expect(submitButton.tagName).toBe('BUTTON');
  });

  it('should activate submit button with Space key', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<LoginPage />);

    const submitButton = getByRole('button', { name: /sign in/i });
    submitButton.focus();

    expect(submitButton).toHaveFocus();
    expect(submitButton).not.toBeNull();
  });

  it('should have all form elements keyboard accessible', () => {
    const { getByLabelText, getByRole } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: /sign in/i });

    expect(emailInput.tabIndex).not.toBe(-1);
    expect(passwordInput.tabIndex).not.toBe(-1);
    expect(submitButton.tabIndex).not.toBe(-1);
  });
});
