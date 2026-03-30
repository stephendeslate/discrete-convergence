/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

// TRACED: AE-UI-007
describe('UI Components', () => {
  describe('Button', () => {
    it('should render with default variant', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeDefined();
      expect(button.className).toContain('bg-blue-600');
    });

    it('should render with destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button).toBeDefined();
      expect(button.className).toContain('bg-red-600');
    });

    it('should handle click events', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Click</Button>);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard interaction', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Press</Button>);
      const button = screen.getByRole('button');
      await user.tab();
      expect(document.activeElement).toBe(button);
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('should render card with header and content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>,
      );
      expect(screen.getByText('Test Card')).toBeDefined();
      expect(screen.getByText('Card content')).toBeDefined();
    });
  });

  describe('Input', () => {
    it('should render input with type', () => {
      render(<Input type="email" placeholder="Email" />);
      const input = screen.getByPlaceholderText('Email');
      expect(input).toBeDefined();
      expect(input.getAttribute('type')).toBe('email');
    });

    it('should accept user input', async () => {
      const user = userEvent.setup();
      render(<Input type="text" placeholder="Name" />);
      const input = screen.getByPlaceholderText('Name');
      await user.type(input, 'John');
      expect(input).toHaveValue('John');
    });
  });

  describe('Label', () => {
    it('should render label with text', () => {
      render(<Label htmlFor="test">Email Address</Label>);
      expect(screen.getByText('Email Address')).toBeDefined();
    });
  });

  describe('Badge', () => {
    it('should render badge with default variant', () => {
      render(<Badge>Active</Badge>);
      expect(screen.getByText('Active')).toBeDefined();
    });

    it('should render badge with destructive variant', () => {
      render(<Badge variant="destructive">Error</Badge>);
      const badge = screen.getByText('Error');
      expect(badge.className).toContain('bg-red-600');
    });
  });

  describe('Skeleton', () => {
    it('should render skeleton element', () => {
      const { container } = render(<Skeleton className="h-10 w-full" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton.className).toContain('animate-pulse');
    });
  });

  describe('Alert', () => {
    it('should render alert with role="alert"', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>,
      );
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Error')).toBeDefined();
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });
  });
});
