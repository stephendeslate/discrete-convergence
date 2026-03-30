import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

// TRACED: EM-TEST-011 — Keyboard navigation tests for UI components

describe('Keyboard Navigation', () => {
  it('should focus Button with Tab key', async () => {
    // TRACED: EM-KB-001
    const user = userEvent.setup();
    render(
      <div>
        <Button data-testid="btn-1">First</Button>
        <Button data-testid="btn-2">Second</Button>
      </div>,
    );

    await user.tab();
    const btn1 = screen.getByTestId('btn-1');
    expect(document.activeElement).toBe(btn1);
    expect(btn1.textContent).toBe('First');

    await user.tab();
    const btn2 = screen.getByTestId('btn-2');
    expect(document.activeElement).toBe(btn2);
    expect(btn2.textContent).toBe('Second');
  });

  it('should activate Button with Enter key', async () => {
    // TRACED: EM-KB-002
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    expect(document.activeElement?.textContent).toBe('Submit');

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should activate Button with Space key', async () => {
    // TRACED: EM-KB-003
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Action</Button>);

    await user.tab();
    expect(document.activeElement?.textContent).toBe('Action');

    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus Input with Tab and allow typing', async () => {
    // TRACED: EM-KB-004
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="kb-input">Name</Label>
        <Input id="kb-input" data-testid="kb-input" placeholder="Enter name" />
      </div>,
    );

    await user.tab();
    // Label is not focusable, so tab goes to input
    const input = screen.getByTestId('kb-input');
    expect(document.activeElement).toBe(input);

    await user.type(input, 'John Doe');
    expect(input).toHaveValue('John Doe');
    expect((input as HTMLInputElement).value.length).toBe(8);
  });

  it('should skip disabled Button during Tab navigation', async () => {
    // TRACED: EM-KB-005
    const user = userEvent.setup();
    render(
      <div>
        <Button data-testid="btn-enabled-1">First</Button>
        <Button data-testid="btn-disabled" disabled>Disabled</Button>
        <Button data-testid="btn-enabled-2">Third</Button>
      </div>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('btn-enabled-1'));

    await user.tab();
    // Disabled button is skipped
    expect(document.activeElement).toBe(screen.getByTestId('btn-enabled-2'));
    expect(screen.getByTestId('btn-disabled')).toBeDisabled();
  });
});
