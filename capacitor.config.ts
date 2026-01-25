/**
 * Capacitor Configuration - Vinculo App
 *
 * Este arquivo configura o Capacitor para gerar apps nativos Android e iOS.
 *
 * Para usar:
 * 1. npm install @capacitor/core @capacitor/cli
 * 2. npm install @capacitor/android @capacitor/ios
 * 3. npx cap add android
 * 4. npx cap add ios
 * 5. npm run build && npx cap sync
 * 6. npx cap open android (ou ios)
 */

const config = {
  // Identificador unico do app (bundle ID / package name)
  appId: 'io.vinculo.app',

  // Nome exibido no dispositivo
  appName: 'Vinculo',

  // Diretorio de build do Vite
  webDir: 'dist',

  // Configuracoes do servidor
  server: {
    // Em desenvolvimento, use a URL do servidor Vite
    // url: 'http://localhost:3000',
    // cleartext: true, // Permitir HTTP (apenas dev)

    // Em producao, usar arquivos locais
    androidScheme: 'https',
    iosScheme: 'https',
  },

  // Plugins
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#4F46E5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },

    // Status Bar
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#4F46E5',
    },

    // Keyboard
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },

    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4F46E5',
      sound: 'beep.wav',
    },
  },

  // Configuracoes Android
  android: {
    buildOptions: {
      // keystorePath: 'path/to/keystore.jks',
      // keystorePassword: 'password',
      // keystoreAlias: 'alias',
      // keystoreAliasPassword: 'password',
    },
    // Versao minima do Android (API 24 = Android 7.0)
    minWebViewVersion: 60,
  },

  // Configuracoes iOS
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    // scrollEnabled: false, // Desabilitar scroll nativo se necessario
  },
};

export default config;
