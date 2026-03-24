/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-003 — EventCard component tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventCard } from '../components/event-card';

expect.extend(toHaveNoViolations);

const mockEvent = {
  id: 'evt-1',
  title: 'Tech Conference 2026',
  description: 'Annual technology conference',
  status: 'PUBLISHED',
  startDate: '2026-06-15T09:00:00Z',
  endDate: '2026-06-17T18:00:00Z',
  venue: { name: 'Convention Center' },
};

describe('EventCard', () => {
  it('renders event title', () => {
    render(<EventCard {...mockEvent} />);
    expect(screen.getByText('Tech Conference 2026')).toBeTruthy();
  });

  it('renders event status badge', () => {
    render(<EventCard {...mockEvent} />);
    expect(screen.getByText('PUBLISHED')).toBeTruthy();
  });

  it('renders event description', () => {
    render(<EventCard {...mockEvent} />);
    expect(screen.getByText('Annual technology conference')).toBeTruthy();
  });

  it('renders venue name when provided', () => {
    render(<EventCard {...mockEvent} />);
    expect(screen.getByText('Convention Center')).toBeTruthy();
  });

  it('does not render venue when not provided', () => {
    const { venue, ...eventWithoutVenue } = mockEvent;
    render(<EventCard {...eventWithoutVenue} />);
    expect(screen.queryByText('Convention Center')).toBeNull();
  });

  it('links to event detail page', () => {
    const { container } = render(<EventCard {...mockEvent} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/events/evt-1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <nav>
        <EventCard {...mockEvent} />
      </nav>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
