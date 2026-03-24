// TRACED:FD-TEST-011
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';

describe('Keyboard Navigation', () => {
  it('Tab moves focus through interactive elements', async () => {
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

  it('Shift+Tab moves focus backwards', async () => {
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

  it('Enter activates button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('Space activates button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled button is skipped in tab order', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button disabled>Disabled</Button>
        <Button>Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText('First')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Third')).toHaveFocus();
  });

  it('Switch toggles with Space', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <div>
        <label id="sw">Toggle</label>
        <Switch aria-labelledby="sw" onCheckedChange={onChange} />
      </div>,
    );

    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('form inputs receive focus in tab order', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input placeholder="Email" />
        <Input placeholder="Password" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('Email')).toHaveFocus();
    await user.tab();
    expect(screen.getByPlaceholderText('Password')).toHaveFocus();
    await user.tab();
    expect(screen.getByText('Submit')).toHaveFocus();
  });
});
