/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-006 — AttendeeTable component tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AttendeeTable } from '../components/attendee-table';

expect.extend(toHaveNoViolations);

const mockAttendees = [
  { id: 'att-1', name: 'Alice Smith', email: 'alice@example.com', checkInStatus: 'CHECKED_IN' },
  { id: 'att-2', name: 'Bob Jones', email: 'bob@example.com', checkInStatus: 'REGISTERED' },
  { id: 'att-3', name: 'Carol Davis', email: 'carol@example.com', checkInStatus: 'NO_SHOW' },
];

describe('AttendeeTable', () => {
  it('renders attendee names', () => {
    render(<AttendeeTable attendees={mockAttendees} />);
    expect(screen.getByText('Alice Smith')).toBeTruthy();
    expect(screen.getByText('Bob Jones')).toBeTruthy();
    expect(screen.getByText('Carol Davis')).toBeTruthy();
  });

  it('renders attendee emails', () => {
    render(<AttendeeTable attendees={mockAttendees} />);
    expect(screen.getByText('alice@example.com')).toBeTruthy();
  });

  it('renders check-in status badges', () => {
    render(<AttendeeTable attendees={mockAttendees} />);
    expect(screen.getByText('CHECKED IN')).toBeTruthy();
    expect(screen.getByText('REGISTERED')).toBeTruthy();
    expect(screen.getByText('NO SHOW')).toBeTruthy();
  });

  it('shows empty message when no attendees', () => {
    render(<AttendeeTable attendees={[]} />);
    expect(screen.getByText('No attendees yet')).toBeTruthy();
  });

  it('shows custom empty message', () => {
    render(<AttendeeTable attendees={[]} emptyMessage="No registrations" />);
    expect(screen.getByText('No registrations')).toBeTruthy();
  });

  it('renders table headers', () => {
    render(<AttendeeTable attendees={mockAttendees} />);
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AttendeeTable attendees={mockAttendees} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
