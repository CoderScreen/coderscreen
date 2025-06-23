import { createFileRoute } from '@tanstack/react-router';
import Sidebar from '@/components/dashboard/Sidebar';
import { Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex h-screen w-full'>
      <Sidebar />
      <Outlet />
    </div>
  );
}
