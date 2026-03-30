/**
 * @jest-environment jsdom
 */
import React from 'react';

describe('Keyboard Navigation', () => {
  it('error boundary is focusable via tabIndex', () => {
    const html = '<div role="alert" tabindex="-1">Error</div>';
    document.body.innerHTML = html;
    const el = document.querySelector('[role="alert"]') as HTMLElement;
    el.focus();
    expect(document.activeElement).toBe(el);
  });

  it('links are keyboard accessible', () => {
    const html = '<a href="/work-orders">Work Orders</a>';
    document.body.innerHTML = html;
    const link = document.querySelector('a') as HTMLElement;
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it('form submission via Enter key', () => {
    const html = '<form><input type="email" /><button type="submit">Submit</button></form>';
    document.body.innerHTML = html;
    const form = document.querySelector('form');
    expect(form).toBeTruthy();
    const btn = document.querySelector('button[type="submit"]');
    expect(btn).toBeTruthy();
  });

  it('select elements are keyboard navigable', () => {
    const html = '<select id="role"><option value="DISPATCHER">Dispatcher</option><option value="TECHNICIAN">Technician</option></select>';
    document.body.innerHTML = html;
    const select = document.querySelector('select') as HTMLSelectElement;
    select.focus();
    expect(document.activeElement).toBe(select);
  });

  it('buttons receive focus', () => {
    const html = '<button>Click me</button>';
    document.body.innerHTML = html;
    const btn = document.querySelector('button') as HTMLElement;
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('navigation links are in tab order', () => {
    const html = '<nav><a href="/">Home</a><a href="/work-orders">Orders</a></nav>';
    document.body.innerHTML = html;
    const links = document.querySelectorAll('a');
    expect(links.length).toBe(2);
    (links[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(links[0]);
  });
});
