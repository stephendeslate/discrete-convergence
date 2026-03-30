/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

describe('Keyboard Navigation', () => {
  it('should focus Button on Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should activate Button on Enter', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should activate Button on Space', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should tab through form fields in order', async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText('Email')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Password')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should allow keyboard input in Input fields', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>,
    );

    const input = screen.getByLabelText('Name');
    await user.click(input);
    await user.type(input, 'Fleet Truck');
    expect(input).toHaveValue('Fleet Truck');
  });

  it('should allow keyboard selection in Select', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="DISPATCHER">
          <option value="DISPATCHER">Dispatcher</option>
          <option value="DRIVER">Driver</option>
        </Select>
      </div>,
    );

    const select = screen.getByLabelText('Role');
    await user.tab();
    expect(select).toHaveFocus();
  });

  it('should support disabled Button state', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should support disabled Input state', () => {
    render(
      <div>
        <Label htmlFor="disabled-input">Disabled</Label>
        <Input id="disabled-input" name="disabled" disabled />
      </div>,
    );

    const input = screen.getByLabelText('Disabled');
    expect(input).toBeDisabled();
  });

  it('should tab through Card content', async () => {
    const user = userEvent.setup();
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <Input id="card-input" name="card-input" placeholder="Type here" />
          <Button>Action</Button>
        </CardContent>
      </Card>,
    );

    await user.tab();
    expect(screen.getByPlaceholderText('Type here')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('should handle focus on error state with tabIndex={-1}', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <div role="alert" ref={ref} tabIndex={-1}>
        <h2>Error occurred</h2>
        <Button>Retry</Button>
      </div>,
    );

    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});
