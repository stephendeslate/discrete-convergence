import React from 'react';
import { render } from '@testing-library/react';
import DashboardLoading from '../app/dashboard/loading';
import DataSourcesLoading from '../app/data-sources/loading';
import LoginLoading from '../app/login/loading';

describe('Loading States', () => {
  it('dashboard loading should have role="status" and aria-busy', () => {
    const { container } = render(<DashboardLoading />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('data sources loading should have role="status" and aria-busy', () => {
    const { container } = render(<DataSourcesLoading />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });

  it('login loading should have role="status" and aria-busy', () => {
    const { container } = render(<LoginLoading />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl).toBeTruthy();
    expect(statusEl?.getAttribute('aria-busy')).toBe('true');
  });
});
