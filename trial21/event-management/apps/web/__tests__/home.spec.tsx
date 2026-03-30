import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain('Event Management');
  });

  it('should have sign in and register links', () => {
    render(<HomePage />);
    const signIn = screen.getByText('Sign In');
    const register = screen.getByText('Create Account');
    expect(signIn).toBeDefined();
    expect(register).toBeDefined();
  });
});
