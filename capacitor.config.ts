import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.atmos.app',
  appName: 'ATMOS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
