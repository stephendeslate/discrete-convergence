/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:FD-AX-002
describe('Keyboard Navigation', () => {
  it('should focus Button with Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByText('Click me')).toHaveFocus();
  });

  it('should trigger Button click with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger Button click with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Input with Tab key', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    await user.tab();
    expect(screen.getByTestId('test-input')).toHaveFocus();
  });

  it('should type in Input with keyboard', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    await user.tab();
    await user.type(screen.getByTestId('test-input'), 'Hello');
    expect(screen.getByTestId('test-input')).toHaveValue('Hello');
  });

  it('should navigate between multiple focusable elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Input data-testid="input" />
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('input')).toHaveFocus();
  });
});
