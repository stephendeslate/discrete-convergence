/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '../components/card';

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeTruthy();
  });

  it('applies base classes for border and shadow', () => {
    render(<Card>Styled card</Card>);
    const card = screen.getByText('Styled card');
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('border');
    expect(card.className).toContain('shadow-sm');
  });

  it('merges custom className', () => {
    render(<Card className="p-8">Padded</Card>);
    const card = screen.getByText('Padded');
    expect(card.className).toContain('p-8');
  });
});
