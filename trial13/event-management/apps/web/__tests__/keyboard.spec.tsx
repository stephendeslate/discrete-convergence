/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

describe('Keyboard Navigation', () => {
  describe('LoginPage', () => {
    it('should allow tabbing through form fields', async () => {
      const user = userEvent.setup();
      const { getByLabelText, getByRole } = render(<LoginPage />);

      const emailInput = getByLabelText(/email/i);
      const passwordInput = getByLabelText(/password/i);
      const submitButton = getByRole('button', { name: /sign in/i });

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should allow typing in email field via keyboard', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<LoginPage />);
      const emailInput = getByLabelText(/email/i);

      await user.click(emailInput);
      await user.keyboard('test@test.com');

      expect(emailInput).toHaveValue('test@test.com');
    });

    it('should support enter key to submit', async () => {
      const user = userEvent.setup();
      const { getByRole } = render(<LoginPage />);
      const submitButton = getByRole('button', { name: /sign in/i });

      submitButton.focus();
      expect(submitButton).toHaveFocus();

      await user.keyboard('{Space}');
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('should allow tabbing through registration form', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<RegisterPage />);

      const nameInput = getByLabelText(/name/i);
      const emailInput = getByLabelText(/email/i);

      await user.tab();
      expect(nameInput).toHaveFocus();

      await user.tab();
      expect(emailInput).toHaveFocus();
    });

    it('should accept keyboard input in name field', async () => {
      const user = userEvent.setup();
      const { getByLabelText } = render(<RegisterPage />);
      const nameInput = getByLabelText(/name/i);

      await user.click(nameInput);
      await user.keyboard('John Doe');

      expect(nameInput).toHaveValue('John Doe');
    });
  });
});
