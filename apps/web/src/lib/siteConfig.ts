export const siteConfig = {
  routes: {
    dashboard: '/',
    rooms: '/rooms',
    room: (id: string) => `/rooms/${id}`,
    settings: '/settings',
  },
};
