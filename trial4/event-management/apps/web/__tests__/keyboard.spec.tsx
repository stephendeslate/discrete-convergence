// TRACED:EM-AX-002 — keyboard navigation tests with userEvent tab/enter/space
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should tab through button and input', async () => {
    const user = userEvent.setup();
    const { getByRole, getByPlaceholderText } = render(
      <div>
        <Button>Submit</Button>
        <Input placeholder="Name" />
      </div>,
    );

    await user.tab();
    expect(getByRole('button')).toHaveFocus();

    await user.tab();
    expect(getByPlaceholderText('Name')).toHaveFocus();
  });

  it('should activate button with Enter', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);

    const button = getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Click</Button>);

    const button = getByRole('button');
    button.focus();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should type in input field', async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText } = render(<Input placeholder="Email" />);

    const input = getByPlaceholderText('Email');
    await user.click(input);
    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });
});
