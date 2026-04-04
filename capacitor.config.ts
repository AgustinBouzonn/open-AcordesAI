import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.acordesai.app',
  appName: 'AcordesAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://tu-dominio.com'
  }
};

export default config;
