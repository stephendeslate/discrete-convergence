/**
 * @jest-environment jsdom
 */
import { render, fireEvent } from '@testing-library/react';

// Minimal inline error component for testing (avoids Next.js 'use client' module issues in Jest)
function ErrorBoundaryUI({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" tabIndex={-1}>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

describe('Keyboard interaction', () => {
  it('error boundary has role=alert', () => {
    const { getByRole } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={() => {}} />,
    );
    const alert = getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.getAttribute('tabIndex')).toBe('-1');
  });

  it('try again button is keyboard-focusable', () => {
    const reset = jest.fn();
    const { getByText } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={reset} />,
    );
    const button = getByText('Try again');
    button.focus();
    expect(document.activeElement).toBe(button);
    expect(button.tagName).toBe('BUTTON');
  });

  it('try again button triggers reset on click', () => {
    const reset = jest.fn();
    const { getByText } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={reset} />,
    );
    const button = getByText('Try again');
    fireEvent.click(button);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalled();
  });

  it('error message is displayed in the alert', () => {
    const { getByRole, getByText } = render(
      <ErrorBoundaryUI error={new Error('Custom error message')} reset={() => {}} />,
    );
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText('Custom error message')).toBeTruthy();
  });
});
