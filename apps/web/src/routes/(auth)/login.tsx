import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { SignInView } from '@/components/auth/SignInView';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
  validateSearch: zodValidator(
    z.object({
      callbackUrl: z.string().optional(),
    })
  ),
});

function RouteComponent() {
  return <SignInView />;
}
