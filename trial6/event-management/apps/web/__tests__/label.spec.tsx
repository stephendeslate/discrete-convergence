/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-UI-001 — Label component tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Label } from '../components/ui/label';

expect.extend(toHaveNoViolations);

describe('Label', () => {
  it('renders children text', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  it('renders required indicator when required prop is set', () => {
    render(<Label required>Email</Label>);
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('does not render required indicator by default', () => {
    const { container } = render(<Label>Email</Label>);
    expect(container.querySelector('.text-red-500')).toBeNull();
  });

  it('associates with input via htmlFor', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    const label = screen.getByText('Email');
    expect(label.getAttribute('for')).toBe('email-input');
  });

  it('has no accessibility violations when paired with input', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="test-input">Test Field</Label>
        <input id="test-input" type="text" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
