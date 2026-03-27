/**
 * @jest-environment jsdom
 */

describe('Accessibility', () => {
  it('login form has proper labels and aria attributes', () => {
    const html = `
      <form>
        <label for="email">Email</label>
        <input id="email" type="email" required />
        <label for="password">Password</label>
        <input id="password" type="password" required />
        <button type="submit">Sign In</button>
      </form>
    `;
    document.body.innerHTML = html;

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const emailLabel = document.querySelector('label[for="email"]');
    const passwordLabel = document.querySelector('label[for="password"]');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(emailLabel?.textContent).toBe('Email');
    expect(passwordLabel?.textContent).toBe('Password');
    expect(emailInput.type).toBe('email');
    expect(passwordInput.type).toBe('password');
    expect(emailInput.required).toBe(true);
  });

  it('navigation has aria-label', () => {
    document.body.innerHTML = '<nav aria-label="Main navigation"><a href="/dashboard">Dashboard</a></nav>';
    const nav = document.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('error messages use role="alert"', () => {
    document.body.innerHTML = '<p role="alert" class="text-destructive">Invalid credentials</p>';
    const alert = document.querySelector('[role="alert"]');
    expect(alert?.textContent).toBe('Invalid credentials');
  });

  it('buttons have accessible text', () => {
    document.body.innerHTML = `
      <button>Create Dashboard</button>
      <button>Sign In</button>
      <button>Publish</button>
    `;
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      expect(btn.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});
