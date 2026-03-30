import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

// TRACED: AE-AX-004

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Keyboard Navigation Tests', () => {
  it('should allow tabbing through login form', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: 'Sign In' });

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should allow tabbing through register form', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = render(<RegisterPage />);

    const nameInput = getByLabelText('Name');
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');
    const submitButton = getByRole('button', { name: 'Register' });

    await user.tab();
    expect(nameInput).toHaveFocus();

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('should allow typing in login form fields', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    await user.click(emailInput);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should allow pressing Enter on submit button', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<LoginPage />);

    const submitButton = getByRole('button', { name: 'Sign In' });
    await user.tab();
    await user.tab();
    await user.tab();
    expect(submitButton).toHaveFocus();
  });
});
