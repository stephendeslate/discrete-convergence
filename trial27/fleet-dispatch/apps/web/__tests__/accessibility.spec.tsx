// TRACED: FD-FE-010 — Accessibility tests
/**
 * @jest-environment jsdom
 */
import React from 'react';

// Test accessibility requirements without rendering full components
describe('Accessibility', () => {
  describe('HTML lang attribute', () => {
    it('should specify lang="en" on the html element', () => {
      // Verify the layout.tsx exports metadata and uses lang="en"
      // This is a structural check — the layout sets <html lang="en">
      const layoutSource = require('fs').readFileSync(
        require('path').join(__dirname, '../app/layout.tsx'),
        'utf-8',
      );
      expect(layoutSource).toContain('lang="en"');
    });
  });

  describe('Navigation', () => {
    it('should include aria-label="Main navigation" on nav element', () => {
      const navSource = require('fs').readFileSync(
        require('path').join(__dirname, '../components/nav.tsx'),
        'utf-8',
      );
      expect(navSource).toContain('aria-label="Main navigation"');
    });
  });

  describe('Error alerts', () => {
    it('should use role="alert" for error messages on login page', () => {
      const loginSource = require('fs').readFileSync(
        require('path').join(__dirname, '../app/login/page.tsx'),
        'utf-8',
      );
      expect(loginSource).toContain('role="alert"');
    });

    it('should use role="alert" for error messages on register page', () => {
      const registerSource = require('fs').readFileSync(
        require('path').join(__dirname, '../app/register/page.tsx'),
        'utf-8',
      );
      expect(registerSource).toContain('role="alert"');
    });
  });

  describe('Form labels', () => {
    it('should have labels with htmlFor on login page', () => {
      const loginSource = require('fs').readFileSync(
        require('path').join(__dirname, '../app/login/page.tsx'),
        'utf-8',
      );
      expect(loginSource).toContain('htmlFor="email"');
      expect(loginSource).toContain('htmlFor="password"');
    });
  });

  describe('Dark mode support', () => {
    it('should include dark class on html element', () => {
      const layoutSource = require('fs').readFileSync(
        require('path').join(__dirname, '../app/layout.tsx'),
        'utf-8',
      );
      expect(layoutSource).toContain('dark');
    });
  });
});
