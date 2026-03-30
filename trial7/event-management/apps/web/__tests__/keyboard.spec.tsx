/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:EM-AX-002
describe('Keyboard Navigation', () => {
  it('should focus button via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);
    await user.tab();
    expect(screen.getByText('Click me')).toHaveFocus();
  });

  it('should activate button via Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button via Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input via Tab', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" placeholder="Type here" />);
    await user.tab();
    expect(screen.getByTestId('input')).toHaveFocus();
  });

  it('should type in input field', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" />);
    await user.tab();
    await user.keyboard('hello');
    expect(screen.getByTestId('input')).toHaveValue('hello');
  });

  it('should tab through multiple elements', async () => {
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
