import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

function LoadingSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

describe('Accessibility', () => {
  it('loading skeleton has no a11y violations', async () => {
    const { container } = render(<LoadingSkeleton />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading skeleton has role="status"', () => {
    const { getByRole } = render(<LoadingSkeleton />);
    const statusEl = getByRole('status');
    expect(statusEl).toBeTruthy();
  });

  it('loading skeleton has aria-busy attribute', () => {
    const { getByRole } = render(<LoadingSkeleton />);
    const statusEl = getByRole('status');
    expect(statusEl.getAttribute('aria-busy')).toBe('true');
  });
});
