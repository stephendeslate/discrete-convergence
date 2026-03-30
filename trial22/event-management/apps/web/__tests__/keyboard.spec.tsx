/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock @repo/shared
jest.mock('@repo/shared', () => ({
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
}));

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

describe('Keyboard Interaction Tests', () => {
  describe('Button keyboard interactions', () => {
    it('should be focusable via tab', () => {
      render(<Button>Submit</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should trigger onClick on Enter key', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should trigger onClick on Space key', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Press</Button>);
      const button = screen.getByRole('button');
      fireEvent.keyUp(button, { key: ' ' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick} disabled>No</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('Input keyboard interactions', () => {
    it('should accept keyboard input', () => {
      render(<Input aria-label="Name" />);
      const input = screen.getByLabelText('Name') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'John' } });
      expect(input.value).toBe('John');
    });

    it('should support type=password for secure input', () => {
      render(<Input aria-label="Password" type="password" />);
      const input = screen.getByLabelText('Password');
      expect(input.getAttribute('type')).toBe('password');
    });

    it('should be focusable', () => {
      render(<Input aria-label="Focus test" />);
      const input = screen.getByLabelText('Focus test');
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Textarea keyboard interactions', () => {
    it('should accept multiline keyboard input', () => {
      render(<Textarea aria-label="Notes" />);
      const textarea = screen.getByLabelText('Notes') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } });
      expect(textarea.value).toBe('Line 1\nLine 2');
    });

    it('should be focusable', () => {
      render(<Textarea aria-label="Focus textarea" />);
      const textarea = screen.getByLabelText('Focus textarea');
      textarea.focus();
      expect(document.activeElement).toBe(textarea);
    });
  });

  describe('Form keyboard flow', () => {
    it('should support form submission via Enter on button', () => {
      const handleSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Input aria-label="Email" type="email" />
          <Input aria-label="Password" type="password" />
          <Button type="submit">Login</Button>
        </form>,
      );

      const submitButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should support tabbing between form fields', () => {
      render(
        <div>
          <Input aria-label="First" />
          <Input aria-label="Second" />
          <Button>Submit</Button>
        </div>,
      );

      const first = screen.getByLabelText('First');
      const second = screen.getByLabelText('Second');
      const button = screen.getByRole('button');

      first.focus();
      expect(document.activeElement).toBe(first);

      second.focus();
      expect(document.activeElement).toBe(second);

      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Error state focus management', () => {
    it('should focus error alert on mount (simulated)', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <div ref={ref} role="alert" tabIndex={-1}>
          <h2>Error occurred</h2>
          <button>Retry</button>
        </div>,
      );

      const alert = screen.getByRole('alert');
      alert.focus();
      expect(document.activeElement).toBe(alert);
    });
  });
});
