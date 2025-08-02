import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f7353e3384cc4a9199365b1c87fbb257',
  appName: 'bookworm-galaxy',
  webDir: 'dist',
  server: {
    url: 'https://f7353e33-84cc-4a91-9936-5b1c87fbb257.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false
    }
  }
};

export default config;