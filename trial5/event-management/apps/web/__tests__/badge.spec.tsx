/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-UI-002 — Badge component tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from '../components/ui/badge';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeTruthy();
  });

  it('applies default variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-800');
  });

  it('applies success variant classes', () => {
    render(<Badge variant="success">Published</Badge>);
    const badge = screen.getByText('Published');
    expect(badge.className).toContain('bg-green-100');
  });

  it('applies danger variant classes', () => {
    render(<Badge variant="danger">Cancelled</Badge>);
    const badge = screen.getByText('Cancelled');
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies outline variant classes', () => {
    render(<Badge variant="outline">Draft</Badge>);
    const badge = screen.getByText('Draft');
    expect(badge.className).toContain('border');
    expect(badge.className).toContain('bg-transparent');
  });

  it('merges custom className', () => {
    render(<Badge className="ml-2">Custom</Badge>);
    const badge = screen.getByText('Custom');
    expect(badge.className).toContain('ml-2');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="danger">Danger</Badge>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
