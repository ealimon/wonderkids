interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
  };
  ios?: {
    minVersion?: string;
    contentInset?: string;
    allowsLinkPreview?: boolean;
    handleApplicationURL?: boolean;
  };
}

const config: CapacitorConfig = {
  appId: 'com.limon.storybookeducation',
  appName: 'WonderKids Adventure Portal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    minVersion: '16.0',
    contentInset: 'always',
    allowsLinkPreview: false,
    handleApplicationURL: false
  }
};

export default config;
