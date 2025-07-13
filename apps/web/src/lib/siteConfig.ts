export const siteConfig = {
  routes: {
    dashboard: '/',
    rooms: '/rooms',
    room: (id: string) => `/rooms/${id}`,
    assessments: '/assessments',
    takeHomes: '/take-homes',
    candidates: '/candidates',
    settings: '/settings',
    orgSettings: '/settings',
    billing: '/settings/billing',
    apiKeys: '/settings/api-keys',
    team: '/settings/team',
  },
  externalRoutes: {
    documentation: 'https://mintlify.com',
  },
};
