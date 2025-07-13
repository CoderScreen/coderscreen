import { createFileRoute } from '@tanstack/react-router';
import { SettingsView } from '@/components/settings/SettingsView';

export const Route = createFileRoute('/_app/settings/')({
  beforeLoad: async () => {
    console.log('beforeLoad settings route.tsx');
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <SettingsView />;
}
