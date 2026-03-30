/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import HomePage from '../app/page';

expect.extend(toHaveNoViolations);

// TRACED: EM-AX-001
describe('Accessibility Tests', () => {
  it('should have no accessibility violations on login page', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations on register page', async () => {
    const { container } = render(<RegisterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations on home page', async () => {
    const { container } = render(<HomePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper form labels on login page', () => {
    const { getByLabelText } = render(<LoginPage />);
    expect(getByLabelText('Email')).toBeDefined();
    expect(getByLabelText('Password')).toBeDefined();
  });

  it('should have proper form labels on register page', () => {
    const { getByLabelText } = render(<RegisterPage />);
    expect(getByLabelText('Name')).toBeDefined();
    expect(getByLabelText('Email')).toBeDefined();
    expect(getByLabelText('Password')).toBeDefined();
  });

  it('should have aria-required on required fields', () => {
    const { container } = render(<LoginPage />);
    const requiredFields = container.querySelectorAll('[aria-required="true"]');
    expect(requiredFields.length).toBeGreaterThanOrEqual(2);
  });
});
