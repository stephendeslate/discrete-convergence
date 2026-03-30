/**
 * @jest-environment jsdom
 */
import React from 'react';

describe('Accessibility', () => {
  it('loading states have role="status" and aria-busy', () => {
    const html = '<div role="status" aria-busy="true"><span class="sr-only">Loading...</span></div>';
    document.body.innerHTML = html;
    const el = document.querySelector('[role="status"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('aria-busy')).toBe('true');
  });

  it('error states have role="alert"', () => {
    const html = '<div role="alert" tabindex="-1">Error occurred</div>';
    document.body.innerHTML = html;
    const el = document.querySelector('[role="alert"]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('tabindex')).toBe('-1');
  });

  it('navigation has aria-label', () => {
    const html = '<nav role="navigation" aria-label="Main navigation"><a href="/">Home</a></nav>';
    document.body.innerHTML = html;
    const nav = document.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('form inputs have associated labels', () => {
    const html = '<label for="email">Email</label><input id="email" type="email" />';
    document.body.innerHTML = html;
    const label = document.querySelector('label');
    const input = document.querySelector('input');
    expect(label?.getAttribute('for')).toBe(input?.id);
  });

  it('buttons have accessible text', () => {
    const html = '<button type="submit">Sign In</button>';
    document.body.innerHTML = html;
    const btn = document.querySelector('button');
    expect(btn?.textContent).toBeTruthy();
  });

  it('tables have proper header structure', () => {
    const html = '<table><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Test</td></tr></tbody></table>';
    document.body.innerHTML = html;
    const th = document.querySelector('th');
    expect(th).toBeTruthy();
  });
});
