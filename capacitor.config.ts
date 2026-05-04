import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'feality.dans',
  appName: 'Dansguiden',
  webDir: 'dist',
  // Cap 6 default flipped to https; pin http to keep existing
  // @capacitor/preferences user data accessible after upgrade.
  server: {
    androidScheme: 'http'
  }
};

export default config;
