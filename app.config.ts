import { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'frank',
  description: 'Расписания занятий в ПГУ',
  slug: 'frank',
  scheme: 'frank',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#ffffff',
  notification: {
    icon: './src/assets/images/icon.png',
  },
  androidStatusBar: {
    translucent: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.piscopancer.frank',
  },
  experiments: {
    typedRoutes: true,
  },

  plugins: [
    '@prisma/react-native',
    // 'expo-localization',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/splash.png',
        resizeMode: 'contain',
        imageWidth: 200,
        backgroundColor: '#000000',
      },
    ],
    // [
    //   'expo-notifications',
    //   {
    //     icon: './src/assets/images/icon.png',
    //   },
    // ],
    'expo-router',
    [
      'expo-font',
      {
        fonts: ['./src/assets/fonts/Geist-Regular.otf', './src/assets/fonts/Geist-Bold.otf', './src/assets/fonts/GeistMono-Regular.otf', './src/assets/fonts/GeistMono-Bold.otf'],
      },
    ],
  ],
  // extra: {
  //   eas: {
  //     projectId: 'fe8e6c6f-30a9-4d02-b409-ef6cad693fcb',
  //   },
  // },
})
