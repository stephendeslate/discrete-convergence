/**
 * @jest-environment jsdom
 */

describe('Accessibility', () => {
  it('should have lang attribute on html element in layout', () => {
    // Layout renders <html lang="en"> which we verify by reading the source
    const fs = require('fs');
    const layoutSource = fs.readFileSync(
      require.resolve('../app/layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).toContain('lang="en"');
    expect(layoutSource).toContain('<html');
  });

  it('should have role="status" on loading components', () => {
    const fs = require('fs');
    const paths = [
      '../app/dashboard/loading.tsx',
      '../app/data-sources/loading.tsx',
      '../app/settings/loading.tsx',
    ];

    paths.forEach((p) => {
      const source = fs.readFileSync(require.resolve(p), 'utf-8');
      expect(source).toContain('role="status"');
    });
  });

  it('should have role="alert" on error components', () => {
    const fs = require('fs');
    const paths = [
      '../app/dashboard/error.tsx',
      '../app/data-sources/error.tsx',
      '../app/settings/error.tsx',
    ];

    paths.forEach((p) => {
      const source = fs.readFileSync(require.resolve(p), 'utf-8');
      expect(source).toContain('role="alert"');
    });
  });

  it('should use useRef and focus in error components', () => {
    const fs = require('fs');
    const paths = [
      '../app/dashboard/error.tsx',
      '../app/data-sources/error.tsx',
      '../app/settings/error.tsx',
    ];

    paths.forEach((p) => {
      const source = fs.readFileSync(require.resolve(p), 'utf-8');
      expect(source).toContain('useRef');
      expect(source).toContain('.focus()');
      expect(source).toContain('tabIndex={-1}');
    });
  });

  it('should have aria-required on login form inputs', () => {
    const fs = require('fs');
    const loginSource = fs.readFileSync(
      require.resolve('../app/login/page.tsx'),
      'utf-8',
    );
    expect(loginSource).toContain('aria-required="true"');
    expect(loginSource).toContain('type="email"');
    expect(loginSource).toContain('type="password"');
  });

  it('should have metadata title in layout', () => {
    const fs = require('fs');
    const layoutSource = fs.readFileSync(
      require.resolve('../app/layout.tsx'),
      'utf-8',
    );
    expect(layoutSource).toContain('title');
    expect(layoutSource).toContain('Analytics Engine');
  });
});
