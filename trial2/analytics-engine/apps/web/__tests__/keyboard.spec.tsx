/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED:AE-AX-004 — Keyboard navigation tests with userEvent tab/enter/space
describe('Keyboard Navigation', () => {
  it('should tab between interactive elements', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Third')).toHaveFocus();
  });

  it('should activate button with Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should tab to input and type', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="test">Label</label>
        <Input id="test" />
      </div>,
    );

    await user.tab();
    await user.type(screen.getByLabelText('Label'), 'Hello');
    expect(screen.getByLabelText('Label')).toHaveValue('Hello');
  });

  it('should tab in reverse with Shift+Tab', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );

    await user.tab();
    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByText('First')).toHaveFocus();
  });

  it('should not activate disabled button', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button disabled onClick={onClick}>Disabled</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });
});
