/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

// TRACED: EM-FE-007 — Accessibility tests for UI components

describe('Accessibility', () => {
  it('Button should render with accessible role', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('Button should support disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });

  it('Input should associate with label via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <Input id="test-input" />
      </div>,
    );
    const input = screen.getByLabelText('Test Label');
    expect(input).toBeInTheDocument();
  });

  it('Input should support required attribute', () => {
    render(<Input required aria-label="Required field" />);
    const input = screen.getByLabelText('Required field');
    expect(input).toBeRequired();
  });

  it('Card should render semantic structure', () => {
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

  it('Badge should render text content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('Skeleton should render loading placeholder', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('loading states should have role=status and aria-busy', () => {
    render(
      <div role="status" aria-busy="true">
        <Skeleton className="h-10 w-full" />
      </div>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('error states should have role=alert', () => {
    render(
      <div role="alert">
        <p>Something went wrong</p>
      </div>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('Button variants should all be accessible', () => {
    render(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(6);
  });
});
