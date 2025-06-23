import { SignInView } from '@/components/auth/SignInView';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInView />;
}
