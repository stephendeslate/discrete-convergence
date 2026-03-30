/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation', () => {
  it('should focus button with tab key', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('should activate button with enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should activate button with space key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should focus input with tab key', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter email" aria-label="Email" />);

    await user.tab();
    expect(screen.getByPlaceholderText('Enter email')).toHaveFocus();
  });

  it('should tab through multiple focusable elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input placeholder="First" aria-label="First input" />
        <Button>Second</Button>
        <Input placeholder="Third" aria-label="Third input" />
      </div>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('First')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await user.tab();
    expect(screen.getByPlaceholderText('Third')).toHaveFocus();
  });
});
