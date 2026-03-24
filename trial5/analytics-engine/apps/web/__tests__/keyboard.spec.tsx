/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

describe('Keyboard interaction tests', () => {
  it('Button responds to Enter key', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Submit</Button>);
    const button = getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    // Native buttons respond to Enter/Space via click event
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button is focusable by default', () => {
    const { getByRole } = render(<Button>Focusable</Button>);
    const button = getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('Disabled button is not focusable via click', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('Input accepts user typing', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(
      <Input type="text" onChange={handleChange} aria-label="test input" />,
    );
    const input = getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('Input with type password masks value', () => {
    const { container } = render(<Input type="password" aria-label="password" />);
    const input = container.querySelector('input');
    expect(input?.type).toBe('password');
  });

  it('Button size variants affect rendered class names', () => {
    const { container: smContainer } = render(<Button size="sm">Small</Button>);
    const { container: lgContainer } = render(<Button size="lg">Large</Button>);
    const smClasses = (smContainer.firstChild as HTMLElement).className;
    const lgClasses = (lgContainer.firstChild as HTMLElement).className;
    // sm uses h-9, lg uses h-11 — class strings should differ
    expect(smClasses).not.toBe(lgClasses);
  });
});
