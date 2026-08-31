interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
  };
}

const config: CapacitorConfig = {
  appId: 'com.limon.wonderkids',
  appName: 'WonderKids Adventure Portal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
