/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

describe('Accessibility', () => {
  describe('LoginPage', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<LoginPage />);
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
      const { getByLabelText } = render(<LoginPage />);
      const emailInput = getByLabelText(/email/i);
      const passwordInput = getByLabelText(/password/i);
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    it('should have required attributes on form fields', () => {
      const { getByLabelText } = render(<LoginPage />);
      const emailInput = getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('RegisterPage', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<RegisterPage />);
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form labels for all fields', () => {
      const { getByLabelText } = render(<RegisterPage />);
      expect(getByLabelText(/name/i)).toBeInTheDocument();
      expect(getByLabelText(/email/i)).toBeInTheDocument();
      expect(getByLabelText(/password/i)).toBeInTheDocument();
    });
  });
});
