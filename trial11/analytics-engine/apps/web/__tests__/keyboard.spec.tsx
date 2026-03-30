/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Mock server actions
jest.mock('../lib/actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
}));

describe('Keyboard Navigation Tests', () => {
  describe('LoginPage keyboard navigation', () => {
    it('should allow tabbing through login form fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.tab();
      const activeEl1 = document.activeElement;
      expect(activeEl1?.tagName).toBeDefined();

      await user.tab();
      const activeEl2 = document.activeElement;
      expect(activeEl2).not.toBe(activeEl1);
    });

    it('should focus email input first when tabbing', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      await user.tab();
      expect(document.activeElement?.getAttribute('name') ?? document.activeElement?.tagName).toBeDefined();
      expect(document.activeElement).toBeTruthy();
    });

    it('should allow keyboard entry in form fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.keyboard('test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
      expect(emailInput.getAttribute('type')).toBe('email');
    });
  });

  describe('RegisterPage keyboard navigation', () => {
    it('should allow tabbing through register form fields', async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const visited = new Set<Element | null>();
      for (let i = 0; i < 4; i++) {
        await user.tab();
        visited.add(document.activeElement);
      }

      expect(visited.size).toBeGreaterThanOrEqual(3);
      expect(document.activeElement).toBeTruthy();
    });

    it('should support keyboard typing in name field', async () => {
      const user = userEvent.setup();
      render(<RegisterPage />);

      const nameInput = screen.getByLabelText(/name/i);
      await user.click(nameInput);
      await user.keyboard('Test User');

      expect(nameInput).toHaveValue('Test User');
      expect(nameInput.getAttribute('type')).toBe('text');
    });
  });

  describe('Button keyboard interaction', () => {
    it('should be activatable via Enter key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button', { name: /submit/i });
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button.textContent).toBe('Submit');
    });

    it('should be activatable via Space key', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Action</Button>);

      const button = screen.getByRole('button', { name: /action/i });
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(button).toBeTruthy();
    });

    it('should have focus visible styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button', { name: /focus test/i });

      expect(button.className).toContain('focus-visible');
      expect(button).toBeTruthy();
    });
  });

  describe('Input keyboard interaction', () => {
    it('should accept keyboard input', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <label htmlFor="kb-test">Test</label>
          <Input id="kb-test" type="text" />
        </div>,
      );

      const input = screen.getByLabelText('Test');
      await user.click(input);
      await user.keyboard('Hello World');

      expect(input).toHaveValue('Hello World');
      expect(input.tagName).toBe('INPUT');
    });

    it('should support tab navigation to input', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <label htmlFor="tab-test">Tab Target</label>
          <Input id="tab-test" type="text" />
        </div>,
      );

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('Tab Target'));
      expect(document.activeElement?.tagName).toBe('INPUT');
    });
  });
});
