/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('Button is focusable via Tab', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Button>Click me</Button>);
    await user.tab();
    expect(getByRole('button')).toHaveFocus();
  });

  it('Button activates with Enter', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
    getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button activates with Space', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    const { getByRole } = render(<Button onClick={onClick}>Click</Button>);
    getByRole('button').focus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Input is focusable and typeable', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Input type="text" />);
    await user.tab();
    expect(getByRole('textbox')).toHaveFocus();
    await user.type(getByRole('textbox'), 'hello');
    expect(getByRole('textbox')).toHaveValue('hello');
  });

  it('disabled Button is not clickable', async () => {
    const onClick = jest.fn();
    const { getByRole } = render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    expect(getByRole('button')).toBeDisabled();
  });

  it('multiple buttons are tab-navigable in order', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );
    const buttons = getAllByRole('button');
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.tab();
    expect(buttons[1]).toHaveFocus();
    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });
});
