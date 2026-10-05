import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.iskcon.folk.sadhana',
  appName: 'FOLK Sadhana',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher_round',
      iconColor: '#DC6820',
    },
  },
};

export default config;
