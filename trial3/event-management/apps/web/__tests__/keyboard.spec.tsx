/**
 * @jest-environment jsdom
 */
// TRACED:EM-AX-002
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation Tests', () => {
  it('should tab between interactive elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input data-testid="input-1" placeholder="First" />
        <Input data-testid="input-2" placeholder="Second" />
        <Button data-testid="button-1">Submit</Button>
      </div>,
    );

    const input1 = screen.getByTestId('input-1');
    const input2 = screen.getByTestId('input-2');
    const button1 = screen.getByTestId('button-1');

    await user.tab();
    expect(input1).toHaveFocus();

    await user.tab();
    expect(input2).toHaveFocus();

    await user.tab();
    expect(button1).toHaveFocus();
  });

  it('should trigger button click on Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    button.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger button click on Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Press me</Button>);

    const button = screen.getByRole('button', { name: 'Press me' });
    button.focus();
    await user.keyboard(' ');

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should allow typing in input fields', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="typing-input" placeholder="Type here" />);

    const input = screen.getByTestId('typing-input');
    await user.click(input);
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('should support shift+tab for reverse navigation', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button data-testid="btn-1">First</Button>
        <Button data-testid="btn-2">Second</Button>
      </div>,
    );

    const btn1 = screen.getByTestId('btn-1');
    const btn2 = screen.getByTestId('btn-2');

    await user.tab();
    expect(btn1).toHaveFocus();

    await user.tab();
    expect(btn2).toHaveFocus();

    await user.tab({ shift: true });
    expect(btn1).toHaveFocus();
  });
});
