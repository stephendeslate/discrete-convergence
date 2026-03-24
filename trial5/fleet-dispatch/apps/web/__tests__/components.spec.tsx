/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { StatusBadge } from '../components/status-badge';

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('destructive');
  });

  it('should forward disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Badge', () => {
  it('should render text content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should apply success variant styling', () => {
    render(<Badge variant="success">OK</Badge>);
    const badge = screen.getByText('OK');
    expect(badge.className).toContain('green');
  });

  it('should apply destructive variant styling', () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge.className).toContain('red');
  });
});

describe('Card', () => {
  it('should render card with header, title, and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>,
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('should render with type and placeholder', () => {
    render(<Input type="email" placeholder="Enter email" />);
    const input = screen.getByPlaceholderText('Enter email');
    expect(input).toHaveAttribute('type', 'email');
  });
});

describe('StatusBadge', () => {
  it('should display status text with underscores replaced by spaces', () => {
    render(<StatusBadge status="IN_TRANSIT" />);
    expect(screen.getByText('IN TRANSIT')).toBeInTheDocument();
  });

  it('should use success variant for AVAILABLE status', () => {
    render(<StatusBadge status="AVAILABLE" />);
    const badge = screen.getByText('AVAILABLE');
    expect(badge.className).toContain('green');
  });

  it('should use destructive variant for FAILED status', () => {
    render(<StatusBadge status="FAILED" />);
    const badge = screen.getByText('FAILED');
    expect(badge.className).toContain('red');
  });

  it('should use outline variant for unknown status', () => {
    render(<StatusBadge status="UNKNOWN" />);
    const badge = screen.getByText('UNKNOWN');
    expect(badge.className).toContain('border');
  });
});
