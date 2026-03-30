/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../components/input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('applies base styling classes', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('rounded');
    expect(input.className).toContain('border');
  });

  it('forwards type attribute', () => {
    render(<Input type="email" data-testid="email-input" />);
    const input = screen.getByTestId('email-input') as HTMLInputElement;
    expect(input.type).toBe('email');
  });
});
