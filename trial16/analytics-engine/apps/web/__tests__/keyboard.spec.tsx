import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

describe('Keyboard Navigation', () => {
  it('login page should support tab navigation between inputs', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Password');

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();
  });

  it('register page should support tab navigation', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<RegisterPage />);

    const emailInput = getByLabelText('Email');
    await user.tab();
    expect(emailInput).toHaveFocus();
  });

  it('login page should allow entering text in fields', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(<LoginPage />);

    const emailInput = getByLabelText('Email');
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
  });
});
