/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import AttendeesError from '../app/attendees/error';
import EventsError from '../app/events/error';

describe('Keyboard Navigation', () => {
  it('Button is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveFocus();
  });

  it('Button fires onClick on Enter', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press me</Button>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button fires onClick on Space', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press me</Button>);
    await user.tab();
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Input is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="kb-input">Name</Label>
        <Input id="kb-input" />
      </div>,
    );
    await user.tab();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('Input accepts typed text', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="type-input">Value</Label>
        <Input id="type-input" />
      </div>,
    );
    const input = screen.getByLabelText('Value');
    await user.click(input);
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('Select is focusable via Tab', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Label htmlFor="kb-select">Choose</Label>
        <Select id="kb-select">
          <option value="a">A</option>
          <option value="b">B</option>
        </Select>
      </div>,
    );
    await user.tab();
    expect(screen.getByLabelText('Choose')).toHaveFocus();
  });

  it('Tab order includes multiple elements', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Second' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Third' })).toHaveFocus();
  });

  it('Error page Try again button is keyboard accessible', async () => {
    const user = userEvent.setup();
    const mockReset = jest.fn();
    render(<AttendeesError error={new Error('fail')} reset={mockReset} />);
    const btn = screen.getByRole('button', { name: 'Try again' });
    btn.focus();
    await user.keyboard('{Enter}');
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('Error page focuses alert container on mount', () => {
    const mockReset = jest.fn();
    render(<EventsError error={new Error('fail')} reset={mockReset} />);
    expect(screen.getByRole('alert')).toHaveFocus();
  });

  it('disabled Button is not clickable', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    await user.click(screen.getByRole('button', { name: 'Disabled' }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
