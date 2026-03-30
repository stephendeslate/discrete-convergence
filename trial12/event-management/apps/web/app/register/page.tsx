import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { registerAction } from '@/lib/actions';

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <Input id="name" name="name" label="Name" placeholder="Your name" required />
            <Input id="email" name="email" type="email" label="Email" placeholder="you@example.com" required />
            <Input id="password" name="password" type="password" label="Password" required />
            <Select
              id="role"
              name="role"
              label="Role"
              options={[
                { value: 'USER', label: 'User' },
                { value: 'ORGANIZER', label: 'Organizer' },
              ]}
            />
            <Input id="tenantId" name="tenantId" label="Tenant ID" required />
            <Button type="submit" className="w-full">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
