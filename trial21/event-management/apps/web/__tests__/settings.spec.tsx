import React from 'react';
import { render, screen } from '@testing-library/react';
import SettingsPage from '../app/settings/page';

describe('SettingsPage', () => {
  it('should render settings heading', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Settings');
  });

  it('should have form labels', () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText('Organization Name')).toBeDefined();
    expect(screen.getByLabelText('Plan Tier')).toBeDefined();
  });
});
