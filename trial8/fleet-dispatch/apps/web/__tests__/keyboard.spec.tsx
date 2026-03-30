/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED: FD-KBD-001
describe('Keyboard Navigation Tests', () => {
  it('Button should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('Button should respond to Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Button should respond to Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('Input should be focusable via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="test">Test</label>
        <Input id="test" />
      </div>,
    );
    await user.tab();
    expect(screen.getByLabelText('Test')).toHaveFocus();
    expect(screen.getByLabelText('Test')).toBeTruthy();
  });

  it('Input should accept typed text', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="test">Test</label>
        <Input id="test" />
      </div>,
    );
    await user.tab();
    await user.type(screen.getByLabelText('Test'), 'hello');
    expect(screen.getByLabelText('Test')).toHaveValue('hello');
    expect(screen.getByLabelText('Test')).toHaveFocus();
  });

  it('multiple buttons should cycle focus with Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();
  });
});
