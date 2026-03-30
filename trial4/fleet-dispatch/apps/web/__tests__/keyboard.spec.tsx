// TRACED:FD-AX-002 — Keyboard navigation tests with userEvent
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus button via Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Focus Me</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Focus Me' })).toHaveFocus();
  });

  it('should activate button via Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press Enter</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button via Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press Space</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should tab through multiple form elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input data-testid="input-1" />
        <Button>Submit</Button>
        <Input data-testid="input-2" />
      </div>,
    );
    await user.tab();
    expect(screen.getByTestId('input-1')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('input-2')).toHaveFocus();
  });

  it('should type in input field', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="text-input" />);
    const input = screen.getByTestId('text-input');
    await user.click(input);
    await user.type(input, 'fleet dispatch');
    expect(input).toHaveValue('fleet dispatch');
  });
});
