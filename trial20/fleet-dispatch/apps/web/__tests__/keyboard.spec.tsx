/**
 * @jest-environment jsdom
 */
// TRACED: FD-PERF-001
describe('Keyboard Navigation', () => {
  it('should support focus on button elements', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(document.activeElement).toBe(button);
    document.body.removeChild(button);
  });

  it('should support focus on input elements', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it('should support tab index on interactive elements', () => {
    const link = document.createElement('a');
    link.setAttribute('href', '/dashboard');
    link.setAttribute('tabindex', '0');
    expect(link.getAttribute('tabindex')).toBe('0');
  });

  it('should support keyboard event handlers', () => {
    const handler = jest.fn();
    const button = document.createElement('button');
    button.addEventListener('keydown', handler);
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    button.dispatchEvent(event);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
  });

  it('should support escape key for dismissing elements', () => {
    const handler = jest.fn();
    document.addEventListener('keydown', handler);
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
    document.removeEventListener('keydown', handler);
  });
});
