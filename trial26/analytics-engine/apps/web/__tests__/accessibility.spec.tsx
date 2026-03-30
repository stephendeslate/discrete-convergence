/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { LoadingSpinner } from '../components/loading-spinner';
import { ErrorMessage } from '../components/error-message';

describe('Accessibility', () => {
  it('loading spinner has role="status"', () => {
    expect(LoadingSpinner).toBeDefined();
    expect(typeof LoadingSpinner).toBe('function');
    const spinnerContent = fs.readFileSync(
      path.join(__dirname, '..', 'components', 'loading-spinner.tsx'),
      'utf-8',
    );
    expect(spinnerContent).toContain('role="status"');
  });

  it('error message has role="alert"', () => {
    expect(ErrorMessage).toBeDefined();
    expect(typeof ErrorMessage).toBe('function');
    const errorContent = fs.readFileSync(
      path.join(__dirname, '..', 'components', 'error-message.tsx'),
      'utf-8',
    );
    expect(errorContent).toContain('role="alert"');
  });

  it('layout has lang attribute on html element', () => {
    const layoutContent = fs.readFileSync(
      path.join(__dirname, '..', 'app', 'layout.tsx'),
      'utf-8',
    );
    expect(layoutContent).toContain('lang="en"');
  });

  it('login form has proper labels', () => {
    const loginContent = fs.readFileSync(
      path.join(__dirname, '..', 'app', 'login', 'page.tsx'),
      'utf-8',
    );
    expect(loginContent).toContain('htmlFor="email"');
    expect(loginContent).toContain('htmlFor="password"');
  });

  it('images and icons have accessible text', () => {
    const spinnerContent = fs.readFileSync(
      path.join(__dirname, '..', 'components', 'loading-spinner.tsx'),
      'utf-8',
    );
    expect(spinnerContent).toContain('sr-only');
    expect(spinnerContent).toContain('Loading...');
  });
});
