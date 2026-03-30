/**
 * @jest-environment jsdom
 */

describe('Keyboard Navigation', () => {
  it('should have correct form label associations in login', () => {
    const fs = require('fs');
    const loginSource = fs.readFileSync(
      require.resolve('../app/login/page.tsx'),
      'utf-8',
    );
    expect(loginSource).toContain('htmlFor="email"');
    expect(loginSource).toContain('id="email"');
    expect(loginSource).toContain('htmlFor="password"');
    expect(loginSource).toContain('id="password"');
  });

  it('should have correct form label associations in register', () => {
    const fs = require('fs');
    const registerSource = fs.readFileSync(
      require.resolve('../app/register/page.tsx'),
      'utf-8',
    );
    expect(registerSource).toContain('htmlFor="name"');
    expect(registerSource).toContain('id="name"');
    expect(registerSource).toContain('htmlFor="email"');
    expect(registerSource).toContain('id="email"');
  });

  it('should have navigation links in home page', () => {
    const fs = require('fs');
    const homeSource = fs.readFileSync(
      require.resolve('../app/page.tsx'),
      'utf-8',
    );
    expect(homeSource).toContain('aria-label="Main navigation"');
    expect(homeSource).toContain('href="/login"');
    expect(homeSource).toContain('href="/register"');
    expect(homeSource).toContain('href="/dashboard"');
  });

  it('should have aria-label on error dialog close button', () => {
    const fs = require('fs');
    const dialogSource = fs.readFileSync(
      require.resolve('../components/dialog.tsx'),
      'utf-8',
    );
    expect(dialogSource).toContain('aria-label="Close dialog"');
    expect(dialogSource).toContain('aria-labelledby');
  });

  it('should use aria-invalid for input error states', () => {
    const fs = require('fs');
    const inputSource = fs.readFileSync(
      require.resolve('../components/input.tsx'),
      'utf-8',
    );
    expect(inputSource).toContain('aria-invalid');
    expect(inputSource).toContain('aria-describedby');
  });

  it('should use aria-hidden on skeleton components', () => {
    const fs = require('fs');
    const skeletonSource = fs.readFileSync(
      require.resolve('../components/skeleton.tsx'),
      'utf-8',
    );
    expect(skeletonSource).toContain('aria-hidden="true"');
  });
});
