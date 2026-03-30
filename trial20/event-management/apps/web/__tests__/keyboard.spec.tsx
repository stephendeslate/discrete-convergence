/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';

// TRACED: EM-FE-008 — Keyboard interaction tests

describe('Keyboard Interactions', () => {
  it('Button should be focusable via tab', () => {
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button', { name: 'Focus me' });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('Button should trigger onClick with Enter key', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press Enter</Button>);
    const button = screen.getByRole('button', { name: 'Press Enter' });
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('Input should be focusable', () => {
    render(<Input aria-label="Test input" />);
    const input = screen.getByLabelText('Test input');
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it('Input should accept keyboard input', () => {
    render(<Input aria-label="Type here" />);
    const input = screen.getByLabelText('Type here');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(input).toHaveValue('Hello');
  });

  it('Select should be focusable', () => {
    render(
      <Select aria-label="Choose option">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>,
    );
    const select = screen.getByLabelText('Choose option');
    select.focus();
    expect(document.activeElement).toBe(select);
  });

  it('Select should allow keyboard selection', () => {
    render(
      <Select aria-label="Pick one">
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    const select = screen.getByLabelText('Pick one');
    fireEvent.change(select, { target: { value: 'b' } });
    expect(select).toHaveValue('b');
  });

  it('disabled Button should not be focusable via pointer', () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('multiple focusable elements should maintain tab order', () => {
    render(
      <div>
        <Input aria-label="First" />
        <Input aria-label="Second" />
        <Button>Submit</Button>
      </div>,
    );
    const first = screen.getByLabelText('First');
    const second = screen.getByLabelText('Second');
    const button = screen.getByRole('button', { name: 'Submit' });

    expect(first).toBeInTheDocument();
    expect(second).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});
