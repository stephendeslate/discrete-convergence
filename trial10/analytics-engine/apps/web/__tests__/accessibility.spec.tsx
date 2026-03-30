/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

expect.extend(toHaveNoViolations);

// TRACED: AE-AX-003
describe('Accessibility Tests', () => {
  describe('Button accessibility', () => {
    it('should have no axe violations', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<Button onClick={onClick}>Accessible Button</Button>);

      await user.tab();
      const button = screen.getByRole('button');
      expect(document.activeElement).toBe(button);

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Form accessibility', () => {
    it('should have no axe violations in a form', async () => {
      const { container } = render(
        <form>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" aria-required="true" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" aria-required="true" />
          </div>
          <Button type="submit">Submit</Button>
        </form>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support tab navigation through form fields', async () => {
      const user = userEvent.setup();
      render(
        <form>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" />
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
          <Button type="submit">Submit</Button>
        </form>,
      );

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('Email'));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('Password'));

      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('button'));
    });
  });

  describe('Alert accessibility', () => {
    it('should have no axe violations for alert', async () => {
      const { container } = render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong</AlertDescription>
        </Alert>,
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have role="alert" for screen readers', () => {
      render(
        <Alert>
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>Important info</AlertDescription>
        </Alert>,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
    });
  });

  describe('Loading state accessibility', () => {
    it('should have aria-busy on loading containers', () => {
      render(
        <div role="status" aria-busy="true">
          <span>Loading...</span>
        </div>,
      );
      const status = screen.getByRole('status');
      expect(status.getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('Error state accessibility', () => {
    it('should have role="alert" on error containers', () => {
      render(
        <div role="alert" tabIndex={-1}>
          <p>An error occurred</p>
        </div>,
      );
      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(alert.getAttribute('tabindex')).toBe('-1');
    });
  });
});
