import { ConfigContext, ExpoConfig } from 'expo/config'
import colors from 'tailwindcss/colors'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ПГУ Сейчас',
  description: 'Расписания занятий в ПГУ',
  slug: 'pgu-seichas',
  scheme: 'pgu-seichas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  platforms: ['android'],
  notification: {
    icon: './src/assets/images/icon.png',
  },
  androidStatusBar: {
    translucent: true,
  },
  androidNavigationBar: {
    backgroundColor: colors.neutral[950],
  },
  android: {
    package: 'com.piscopancer.pguseichas',
    backgroundColor: colors.neutral[950],
    adaptiveIcon: {
      foregroundImage: './src/assets/images/icon.png',
      monochromeImage: './src/assets/images/icon.png',
      backgroundColor: colors.neutral[950],
    },
    splash: {
      backgroundColor: colors.neutral[200],
      image: './src/assets/images/splash-image-for-light.png',
      dark: {
        image: './src/assets/images/splash-image-for-dark.png',
        backgroundColor: colors.neutral[950],
      },
    },
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    'expo-localization',
    '@prisma/react-native',
    'expo-secure-store',
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
