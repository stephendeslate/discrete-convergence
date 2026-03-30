/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:AE-TST-010 — keyboard navigation tests with userEvent
describe('Keyboard Navigation', () => {
  it('should focus button on tab', async () => {
    const user = userEvent.setup();
    render(<Button>Focus me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Focus me' })).toHaveFocus();
  });

  it('should trigger button on Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger button on Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Space me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should tab through multiple inputs', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" />
        <label htmlFor="password">Password</label>
        <Input id="password" type="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });

  it('should type into input field', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" type="text" />
      </div>,
    );

    const input = screen.getByLabelText('Name');
    await user.click(input);
    await user.type(input, 'John Doe');
    expect(input).toHaveValue('John Doe');
  });
});
