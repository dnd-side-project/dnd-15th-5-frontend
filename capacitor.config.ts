import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chapchap05.app',
  appName: 'chapchap',
  backgroundColor: '#ffffff',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      autoBackdropColor: 'auto',
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
      style: KeyboardStyle.Light,
    },
  },
};

export default config;
