import { LoginForm } from '@/components/login-form';

/**
 * VERIFY: AE-A11Y-003 — login page with form labels and heading
 */
export default function LoginPage() {
  return (
    <main>
      <h1>Login</h1>{/* TRACED: AE-A11Y-003 */}
      <LoginForm />
    </main>
  );
}
