/**
 * @jest-environment jsdom
 */
// TRACED:EM-FE-007 — VenueCard component tests with accessibility checks
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VenueCard } from '../components/venue-card';

expect.extend(toHaveNoViolations);

const mockVenue = {
  id: 'ven-1',
  name: 'Convention Center',
  address: '123 Main St, Springfield',
  capacity: 5000,
};

describe('VenueCard', () => {
  it('renders venue name', () => {
    render(<VenueCard {...mockVenue} />);
    expect(screen.getByText('Convention Center')).toBeTruthy();
  });

  it('renders venue address', () => {
    render(<VenueCard {...mockVenue} />);
    expect(screen.getByText('123 Main St, Springfield')).toBeTruthy();
  });

  it('renders formatted capacity', () => {
    render(<VenueCard {...mockVenue} />);
    expect(screen.getByText('Capacity: 5,000')).toBeTruthy();
  });

  it('links to venue detail page', () => {
    const { container } = render(<VenueCard {...mockVenue} />);
    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/venues/ven-1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <nav>
        <VenueCard {...mockVenue} />
      </nav>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
