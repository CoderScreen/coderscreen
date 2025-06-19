import { createFileRoute } from '@tanstack/react-router';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import QuickActions from '../components/dashboard/QuickActions';
import PadFilters from '../components/dashboard/PadFilters';
import PadsTable from '../components/dashboard/PadsTable';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Header />
        <main className='p-8 flex-1 bg-muted'>
          <QuickActions />
          <PadFilters />
          <PadsTable />
        </main>
      </div>
    </div>
  );
}
