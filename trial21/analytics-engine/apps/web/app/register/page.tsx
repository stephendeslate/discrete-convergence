import { RegisterForm } from '@/components/register-form';

/**
 * VERIFY: AE-A11Y-004 — register page with form labels and heading
 */
export default function RegisterPage() {
  return (
    <main>
      <h1>Register</h1>{/* TRACED: AE-A11Y-004 */}
      <RegisterForm />
    </main>
  );
}
