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
    contactSupport: 'mailto:support@coderscreen.com?subject=Support%20Request',
    contactSales: 'mailto:team@coderscreen.com?subject=Enterprise%20Plan%20Request',
    documentation: 'https://mintlify.com',
  },
};
