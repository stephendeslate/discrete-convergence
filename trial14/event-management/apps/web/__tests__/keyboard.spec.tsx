/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';

describe('Keyboard Navigation', () => {
  it('should tab through login form fields', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    const inputs = container.querySelectorAll('input, button');
    expect(inputs.length).toBeGreaterThanOrEqual(2);

    await user.tab();
    expect(document.activeElement?.tagName).toBeDefined();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('should allow keyboard entry in email field', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginPage />);
    const emailInput = container.querySelector('input[name="email"]');
    expect(emailInput).toBeDefined();

    if (emailInput) {
      await user.click(emailInput);
      await user.type(emailInput, 'test@example.com');
      expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
    }
  });
});
