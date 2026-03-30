/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Loading from '../app/loading';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('loading component has no axe violations', async () => {
    const { container } = render(<Loading />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('loading component has role=status', () => {
    const { getByRole } = render(<Loading />);
    const status = getByRole('status');
    expect(status).toBeTruthy();
    expect(status.getAttribute('aria-busy')).toBe('true');
  });

  it('loading component has sr-only text', () => {
    const { getByText } = render(<Loading />);
    expect(getByText('Loading...')).toBeTruthy();
  });
});
