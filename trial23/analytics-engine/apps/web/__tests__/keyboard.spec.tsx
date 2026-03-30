/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

describe('Keyboard navigation', () => {
  it('Button is focusable via Tab and activatable via Enter', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button is activatable via Space', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Action</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled Button is not focusable via Tab', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Button disabled>Disabled</Button>
        <Button>Enabled</Button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Enabled' })).toHaveFocus();
  });

  it('Input fields are focusable via Tab in order', async () => {
    const user = userEvent.setup();

    render(
      <form>
        <Label htmlFor="field-a">Field A</Label>
        <Input id="field-a" name="a" />
        <Label htmlFor="field-b">Field B</Label>
        <Input id="field-b" name="b" />
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText('Field A')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Field B')).toHaveFocus();
  });

  it('Input accepts typed text', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Label htmlFor="typed-input">Typed</Label>
        <Input id="typed-input" />
      </>,
    );

    await user.tab();
    await user.type(screen.getByLabelText('Typed'), 'hello');
    expect(screen.getByLabelText('Typed')).toHaveValue('hello');
  });

  it('multiple buttons can be tabbed between', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('Alert with tabIndex can receive focus', () => {
    const ref = { current: null as HTMLDivElement | null };

    render(
      <div role="alert" tabIndex={-1} ref={(el) => { ref.current = el; }}>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Test error</AlertDescription>
        </Alert>
      </div>,
    );

    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});
