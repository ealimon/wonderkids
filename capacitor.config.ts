import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.limon.wonderkids',
  appName: 'WonderKids Adventure Portal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
