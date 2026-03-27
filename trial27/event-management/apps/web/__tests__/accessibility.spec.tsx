// TRACED: EM-FE-018 — Accessibility tests
/**
 * @jest-environment jsdom
 */

import React from 'react';

// Simple DOM checks without requiring full React rendering
describe('Accessibility', () => {
  it('should have html lang attribute in layout', () => {
    // Verify the layout file contains lang="en"
    const fs = require('fs');
    const path = require('path');
    const layoutContent = fs.readFileSync(
      path.join(__dirname, '../app/layout.tsx'),
      'utf-8',
    );
    expect(layoutContent).toContain('lang="en"');
  });

  it('should have aria-label on main navigation', () => {
    const fs = require('fs');
    const path = require('path');
    const layoutContent = fs.readFileSync(
      path.join(__dirname, '../app/layout.tsx'),
      'utf-8',
    );
    expect(layoutContent).toContain('aria-label="Main navigation"');
  });

  it('should have role="alert" for error messages in login page', () => {
    const fs = require('fs');
    const path = require('path');
    const loginContent = fs.readFileSync(
      path.join(__dirname, '../app/login/page.tsx'),
      'utf-8',
    );
    expect(loginContent).toContain('role="alert"');
  });

  it('should have labels for form inputs in login page', () => {
    const fs = require('fs');
    const path = require('path');
    const loginContent = fs.readFileSync(
      path.join(__dirname, '../app/login/page.tsx'),
      'utf-8',
    );
    expect(loginContent).toContain('htmlFor="email"');
    expect(loginContent).toContain('htmlFor="password"');
  });

  it('should have role="alert" for error messages in register page', () => {
    const fs = require('fs');
    const path = require('path');
    const registerContent = fs.readFileSync(
      path.join(__dirname, '../app/register/page.tsx'),
      'utf-8',
    );
    expect(registerContent).toContain('role="alert"');
  });

  it('should have labels for form inputs in register page', () => {
    const fs = require('fs');
    const path = require('path');
    const registerContent = fs.readFileSync(
      path.join(__dirname, '../app/register/page.tsx'),
      'utf-8',
    );
    expect(registerContent).toContain('htmlFor="email"');
    expect(registerContent).toContain('htmlFor="password"');
    expect(registerContent).toContain('htmlFor="tenantName"');
  });
});
