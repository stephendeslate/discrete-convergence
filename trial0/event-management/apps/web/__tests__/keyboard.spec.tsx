// TRACED:EM-TEST-011
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

describe('Keyboard Navigation', () => {
  it('Button receives focus via Tab and activates with Enter', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Action</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(clicked).toBe(true);
  });

  it('Button activates with Space', async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Press</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(clicked).toBe(true);
  });

  it('Input receives focus via Tab and accepts typing', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    await user.tab();
    expect(screen.getByPlaceholderText('Type here')).toHaveFocus();
    await user.keyboard('hello');
    expect(screen.getByPlaceholderText('Type here')).toHaveValue('hello');
  });

  it('Tab order follows DOM order', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input data-testid="first" />
        <Input data-testid="second" />
        <Button>Third</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByTestId('first')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('second')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('Shift+Tab reverses focus order', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
      </div>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
  });

  it('Disabled button is skipped in tab order', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>Enabled</Button>
        <Button disabled>Disabled</Button>
        <Button>Also Enabled</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Also Enabled' })).toHaveFocus();
  });

  it('Switch toggles with Space', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Toggle" />);
    await user.tab();
    const sw = screen.getByRole('switch', { name: 'Toggle' });
    expect(sw).toHaveFocus();
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('Form fields are navigable in sequence', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input data-testid="name" />
        <Input data-testid="email" type="email" />
        <Input data-testid="password" type="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );
    await user.tab();
    expect(screen.getByTestId('name')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('email')).toHaveFocus();
    await user.tab();
    expect(screen.getByTestId('password')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();
  });
});
