import React, { useRef, useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

function ErrorBoundaryUI({ error }: { error: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div role="alert" ref={ref} tabIndex={-1}>
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button type="button" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}

function InteractiveForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="email">Email</label>
      <input id="email" type="email" name="email" />
      <label htmlFor="name">Name</label>
      <input id="name" type="text" name="name" />
      <button type="submit">Submit</button>
      {submitted && <p role="status">Form submitted</p>}
    </form>
  );
}

describe('Keyboard Navigation', () => {
  it('error boundary receives focus on mount', () => {
    render(<ErrorBoundaryUI error="Test error" />);
    const alert = screen.getByRole('alert');
    expect(document.activeElement).toBe(alert);
  });

  it('error boundary has tabIndex={-1}', () => {
    render(<ErrorBoundaryUI error="Test error" />);
    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('tabindex')).toBe('-1');
  });

  it('tab navigates between form inputs', async () => {
    const user = userEvent.setup();
    render(<InteractiveForm />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Email'));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Submit' }));
  });

  it('enter submits the form', async () => {
    const user = userEvent.setup();
    render(<InteractiveForm />);

    await user.tab();
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('status')).toHaveTextContent('Form submitted');
  });
});
