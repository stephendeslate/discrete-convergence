// TRACED:AE-AX-004 — keyboard navigation tests with userEvent
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus button with Tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should tab through form fields in order', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input aria-label="Email" />
        <Input aria-label="Password" />
        <Button>Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Password' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should not focus disabled buttons', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Disabled' })).not.toHaveFocus();
  });
});
