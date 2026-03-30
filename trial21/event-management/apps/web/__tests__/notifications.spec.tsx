import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationsPage from '../app/notifications/page';

describe('NotificationsPage', () => {
  it('should render notifications heading', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Notifications');
  });

  it('should have subject and body labels', () => {
    render(<NotificationsPage />);
    expect(screen.getByLabelText('Subject')).toBeDefined();
    expect(screen.getByLabelText('Message')).toBeDefined();
  });

  it('should have submit button', () => {
    render(<NotificationsPage />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDefined();
  });
});
