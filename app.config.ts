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
  notification: {
    icon: './src/assets/images/icon.png',
  },
  androidStatusBar: {
    translucent: false,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/icon.png',
      backgroundColor: colors.neutral[950],
    },
    package: 'com.piscopancer.pguseichas',
  },
  experiments: {
    typedRoutes: true,
  },

  plugins: [
    'expo-localization',
    '@prisma/react-native',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/splash.png',
        resizeMode: 'contain',
        imageWidth: 200,
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
  // extra: {
  //   eas: {
  //     projectId: 'fe8e6c6f-30a9-4d02-b409-ef6cad693fcb',
  //   },
  // },
})
