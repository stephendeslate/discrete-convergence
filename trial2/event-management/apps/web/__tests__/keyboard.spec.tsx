/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:EM-AX-002 — Keyboard navigation tests with userEvent

describe('Keyboard Navigation', () => {
  it('should focus button with Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input with Tab key', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter email" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Enter email')).toHaveFocus();
  });

  it('should type in input field', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter email" />);

    await user.tab();
    await user.type(screen.getByPlaceholderText('Enter email'), 'test@test.com');
    expect(screen.getByPlaceholderText('Enter email')).toHaveValue('test@test.com');
  });

  it('should navigate between multiple interactive elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Input placeholder="Third" />
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Third')).toHaveFocus();
  });
});
