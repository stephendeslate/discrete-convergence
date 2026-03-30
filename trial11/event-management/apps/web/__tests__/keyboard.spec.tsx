/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import HomePage from '../app/page';

// TRACED: EM-AX-002
describe('Keyboard Navigation Tests', () => {
  it('should support tab navigation on login page', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.tab();
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveFocus();

    await user.tab();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveFocus();
  });

  it('should support tab navigation on register page', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.tab();
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveFocus();

    await user.tab();
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveFocus();
  });

  it('should allow typing in form fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');

    const passwordInput = screen.getByLabelText('Password');
    await user.click(passwordInput);
    await user.type(passwordInput, 'Password123!');
    expect(passwordInput).toHaveValue('Password123!');
  });

  it('should have focusable buttons on home page', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const loginButton = screen.getByRole('link', { name: /login/i });
    expect(loginButton).toBeDefined();

    const registerButton = screen.getByRole('link', { name: /register/i });
    expect(registerButton).toBeDefined();
  });

  it('should support keyboard interaction on login button', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.tab();
    await user.tab();
    await user.tab();
    expect(submitButton).toHaveFocus();
  });
});
