import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mywallet.digital',
  appName: 'My Digital Wallet',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#F5F7FA',
      androidSplashResourceName: 'splash',
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    }
  }
};

export default config;
