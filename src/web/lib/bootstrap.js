const fallbackBootstrap = {
  app: {
    name: 'Free Members',
    version: '0.1.0',
  },
  logoUrl: '/assets/img/logo.png',
  designSettings: {
    primaryColor: '#ff3d73',
    primaryAccent: 'linear-gradient(135deg, #ff3d73, #ff914d)',
  },
  settings: {},
};

let cachedBootstrap = null;

export function setBootstrap(data) {
  cachedBootstrap = {
    ...fallbackBootstrap,
    ...(data || {}),
    app: {
      ...fallbackBootstrap.app,
      ...(data?.app || {}),
    },
    designSettings: {
      ...fallbackBootstrap.designSettings,
      ...(data?.designSettings || data?.settings?.design || {}),
    },
    settings: data?.settings || {},
  };
  return cachedBootstrap;
}

export function getBootstrap() {
  return cachedBootstrap || fallbackBootstrap;
}
