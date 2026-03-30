/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

/**
 * Keyboard navigation tests using userEvent.
 * TRACED:FD-AX-002
 */
describe('Keyboard Navigation', () => {
  it('should focus button via Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('should activate button via Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button via Space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should navigate between form fields via Tab', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input data-testid="email" name="email" />
        <Input data-testid="password" name="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByTestId('email')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('password')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should type into input field', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    await user.tab();
    await user.type(screen.getByTestId('test-input'), 'hello@test.com');
    expect(screen.getByTestId('test-input')).toHaveValue('hello@test.com');
  });
});
