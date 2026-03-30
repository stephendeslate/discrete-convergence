/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard Navigation Tests', () => {
  it('should focus button on tab', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Button>Click</Button>);

    await user.tab();

    const button = getByRole('button');
    expect(button).toHaveFocus();
    expect(button.textContent).toBe('Click');
  });

  it('should trigger button on enter key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Press me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getByRole('button')).toHaveFocus();
  });

  it('should trigger button on space key', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { getByRole } = render(<Button onClick={onClick}>Space me</Button>);

    await user.tab();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getByRole('button')).toHaveFocus();
  });

  it('should focus input on tab', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<Input type="text" />);

    await user.tab();

    expect(getByRole('textbox')).toHaveFocus();
    expect(document.activeElement?.tagName).toBe('INPUT');
  });

  it('should navigate between multiple focusable elements', async () => {
    const user = userEvent.setup();
    const { getAllByRole } = render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    const buttons = getAllByRole('button');

    await user.tab();
    expect(buttons[0]).toHaveFocus();

    await user.tab();
    expect(buttons[1]).toHaveFocus();

    await user.tab();
    expect(buttons[2]).toHaveFocus();
  });
});
