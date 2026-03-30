/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-UI-003 — Skeleton component tests
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Skeleton } from '../components/ui/skeleton';

expect.extend(toHaveNoViolations);

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild!;
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('bg-gray-200');
    expect(el.className).toContain('rounded-md');
  });

  it('merges custom className for sizing', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstElementChild!;
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-32');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
