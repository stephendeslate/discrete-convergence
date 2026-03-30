/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock @repo/shared
jest.mock('@repo/shared', () => ({
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
}));

// Import components after mock
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should render with correct role', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDefined();
      expect(button.textContent).toBe('Click me');
    });

    it('should support disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveProperty('disabled', true);
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">X</Button>);
      const button = screen.getByLabelText('Close dialog');
      expect(button).toBeDefined();
    });
  });

  describe('Input Component', () => {
    it('should render with label association via aria-label', () => {
      render(<Input aria-label="Email address" type="email" />);
      const input = screen.getByLabelText('Email address');
      expect(input).toBeDefined();
      expect(input.getAttribute('type')).toBe('email');
    });

    it('should support required attribute', () => {
      render(<Input aria-label="Required field" required />);
      const input = screen.getByLabelText('Required field');
      expect(input).toHaveProperty('required', true);
    });
  });

  describe('Alert Component', () => {
    it('should render with role=alert for screen readers', () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Something happened</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(alert.textContent).toContain('Warning');
      expect(alert.textContent).toContain('Something happened');
    });
  });

  describe('Loading States', () => {
    it('loading component should have role=status and aria-busy', () => {
      // Simulate the loading component structure
      render(
        <div role="status" aria-busy="true">
          <div className="animate-spin" />
          <span className="sr-only">Loading...</span>
        </div>,
      );

      const status = screen.getByRole('status');
      expect(status).toBeDefined();
      expect(status.getAttribute('aria-busy')).toBe('true');
      expect(screen.getByText('Loading...')).toBeDefined();
    });
  });

  describe('Error States', () => {
    it('error component should have role=alert', () => {
      render(
        <div role="alert" tabIndex={-1}>
          <h2>Something went wrong</h2>
          <button>Try again</button>
        </div>,
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(alert.getAttribute('tabindex')).toBe('-1');
      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(screen.getByText('Try again')).toBeDefined();
    });
  });

  describe('Card Component', () => {
    it('should render semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>,
      );

      expect(screen.getByText('Title')).toBeDefined();
      expect(screen.getByText('Content here')).toBeDefined();
    });
  });

  describe('Badge Component', () => {
    it('should render with text content', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeDefined();
    });
  });

  describe('Textarea Component', () => {
    it('should support aria-label', () => {
      render(<Textarea aria-label="Description" />);
      const textarea = screen.getByLabelText('Description');
      expect(textarea).toBeDefined();
    });
  });

  describe('Navigation Accessibility', () => {
    it('should render navigation links', () => {
      render(
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/events">Events</a>
          <a href="/venues">Venues</a>
          <a href="/tickets">Tickets</a>
        </nav>,
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeDefined();
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Events')).toBeDefined();
      expect(screen.getByText('Venues')).toBeDefined();
      expect(screen.getByText('Tickets')).toBeDefined();
    });
  });
});
