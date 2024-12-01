import { ConfigContext, ExpoConfig } from 'expo/config'
import colors from 'tailwindcss/colors'
// import { colors } from './src/utils'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'pgu-seichas',
  description: 'Расписания занятий в ПГУ',
  slug: 'pgu-seichas',
  scheme: 'pgu-seichas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: colors.neutral[950],
  platforms: ['android'],
  splash: {
    backgroundColor: colors.neutral[950],
  },
  notification: {
    icon: './src/assets/images/icon.png',
  },
  androidStatusBar: {
    translucent: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/icon.png',
      monochromeImage: './src/assets/images/icon.png',
      backgroundColor: colors.neutral[950],
    },
    backgroundColor: colors.neutral[950],
    package: 'com.piscopancer.pguseichas',
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-localization',
    '@prisma/react-native',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/splash.png',
        resizeMode: 'contain',
        imageWidth: 250,
        backgroundColor: colors.neutral[950],
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
  extra: {
    eas: {
      projectId: '174ea890-85b5-483f-9cac-c2fa7102c221',
    },
  },
})
