import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { RegisterView } from '@/components/auth/RegisterView';

export const Route = createFileRoute('/(auth)/register')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      callbackUrl: z.string().optional(),
    })
  ),
});

function RouteComponent() {
  return <RegisterView />;
}
