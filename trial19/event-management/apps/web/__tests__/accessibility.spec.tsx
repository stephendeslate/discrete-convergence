/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AttendeesLoading from '../app/attendees/loading';
import EventsLoading from '../app/events/loading';
import VenuesLoading from '../app/venues/loading';
import RegistrationsLoading from '../app/registrations/loading';
import DashboardLoading from '../app/dashboard/loading';
import DataSourcesLoading from '../app/data-sources/loading';
import SettingsLoading from '../app/settings/loading';
import LoginLoading from '../app/login/loading';
import RegisterLoading from '../app/register/loading';
import AttendeesError from '../app/attendees/error';
import EventsError from '../app/events/error';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  describe('Loading pages have role="status" and aria-busy', () => {
    it('AttendeesLoading is accessible', async () => {
      const { container } = render(<AttendeesLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('EventsLoading is accessible', async () => {
      const { container } = render(<EventsLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('VenuesLoading is accessible', async () => {
      const { container } = render(<VenuesLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('RegistrationsLoading is accessible', async () => {
      const { container } = render(<RegistrationsLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('DashboardLoading is accessible', async () => {
      const { container } = render(<DashboardLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('DataSourcesLoading is accessible', async () => {
      const { container } = render(<DataSourcesLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('SettingsLoading is accessible', async () => {
      const { container } = render(<SettingsLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('LoginLoading is accessible', async () => {
      const { container } = render(<LoginLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('RegisterLoading is accessible', async () => {
      const { container } = render(<RegisterLoading />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('Error pages have role="alert"', () => {
    const mockError = new Error('Test error');
    const mockReset = jest.fn();

    it('AttendeesError has alert role and heading', () => {
      render(<AttendeesError error={mockError} reset={mockReset} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Attendees Error')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('EventsError has alert role and heading', () => {
      render(<EventsError error={mockError} reset={mockReset} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Events Error')).toBeInTheDocument();
    });
  });

  describe('UI components are accessible', () => {
    it('Button renders with accessible defaults', async () => {
      const { container } = render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('Input with Label is accessible', async () => {
      const { container } = render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </div>,
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('Badge renders accessibly', async () => {
      const { container } = render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('Alert renders with role="alert"', async () => {
      const { container } = render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Something happened</AlertDescription>
        </Alert>,
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('disabled Button has correct attribute', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    });
  });
});
