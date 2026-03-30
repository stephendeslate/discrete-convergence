/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED: FD-AX-002
describe('Keyboard Navigation Tests', () => {
  it('should focus button on tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should trigger button on Enter key', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger button on Space key', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should tab between form elements', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input data-testid="input-1" />
        <Input data-testid="input-2" />
        <Button>Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByTestId('input-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('input-2')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should not focus disabled button on tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input data-testid="input-1" />
        <Button disabled>Disabled</Button>
        <Input data-testid="input-2" />
      </div>,
    );

    await user.tab();
    expect(screen.getByTestId('input-1')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('input-2')).toHaveFocus();
  });

  it('should type in input field', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    await user.click(input);
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });
});
