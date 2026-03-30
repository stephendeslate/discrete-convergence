/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// TRACED: AE-AX-002
describe('Keyboard Navigation', () => {
  it('should focus button with tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    const button = screen.getByRole('button');
    expect(button).toHaveFocus();
    expect(button.textContent).toBe('Click me');
  });

  it('should activate button with enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should activate button with space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should navigate between multiple focusable elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <label htmlFor="text-input">Label</label>
        <Input id="text-input" type="text" />
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByText('Second')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Label')).toHaveFocus();
  });

  it('should type into input field', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <label htmlFor="name">Name</label>
        <Input id="name" type="text" />
      </div>,
    );

    await user.tab();
    await user.keyboard('Test User');
    const input = screen.getByLabelText('Name') as HTMLInputElement;
    expect(input.value).toBe('Test User');
    expect(input).toHaveFocus();
  });

  it('disabled button should not receive focus', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('Enabled')).toHaveFocus();
    expect(screen.getByText('Disabled')).not.toHaveFocus();
  });
});
