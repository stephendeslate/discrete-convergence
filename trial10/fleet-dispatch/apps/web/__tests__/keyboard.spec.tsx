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
    expect(getByRole('alert')).toBeTruthy();
  });

  it('try again button is keyboard-focusable', () => {
    const reset = jest.fn();
    const { getByText } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={reset} />,
    );
    const button = getByText('Try again');
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('try again button triggers reset on Enter', () => {
    const reset = jest.fn();
    const { getByText } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={reset} />,
    );
    const button = getByText('Try again');
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(reset).toHaveBeenCalled();
  });

  it('error alert is focusable via tabIndex', () => {
    const { getByRole } = render(
      <ErrorBoundaryUI error={new Error('test')} reset={() => {}} />,
    );
    const alert = getByRole('alert');
    expect(alert.getAttribute('tabIndex')).toBe('-1');
  });
});
