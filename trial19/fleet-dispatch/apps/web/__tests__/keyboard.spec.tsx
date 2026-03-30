/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Nav } from '../components/nav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// Mock next/link for jsdom
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Keyboard navigation', () => {
  it('nav links are tabbable in order', async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    await user.tab();
    expect(links[0]).toHaveFocus();

    await user.tab();
    expect(links[1]).toHaveFocus();
  });

  it('button is focusable via tab', async () => {
    const user = userEvent.setup();
    render(<Button>Test Button</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('button triggers on Enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('button triggers on Space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click Me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled button is not interactive', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('input is focusable and accepts typing', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    await user.tab();
    const input = screen.getByPlaceholderText('Type here');
    expect(input).toHaveFocus();

    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('multiple inputs can be tabbed through', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input data-testid="first" />
        <Input data-testid="second" />
      </form>
    );

    await user.tab();
    expect(screen.getByTestId('first')).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId('second')).toHaveFocus();
  });
});
