import '@/assets/style.css'
import { initializeDb } from '@/db'
import { qc } from '@/query'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PortalProvider } from '@gorhom/portal'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { cssInterop } from 'nativewind'
import { useEffect, useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Svg from 'react-native-svg'

SplashScreen.preventAutoHideAsync()

cssInterop(Svg, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      width: true,
      height: true,
    },
  },
})

export default function RootLayout() {
  const [fonts] = useFonts({
    'Geist-Regular': require('@/assets/fonts/Geist-Regular.otf'),
    'Geist-Bold': require('@/assets/fonts/Geist-Bold.otf'),
    'GeistMono-Regular': require('@/assets/fonts/GeistMono-Regular.otf'),
    'GeistMono-Bold': require('@/assets/fonts/GeistMono-Bold.otf'),
  })
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    initializeDb().then(() => setDbInitialized(true))
  }, [])

  useEffect(() => {
    if (fonts && dbInitialized) {
      SplashScreen.hideAsync()
    }
  }, [fonts, dbInitialized])

  if (!fonts || !dbInitialized) {
    return null
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <GestureHandlerRootView>
          <PortalProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
            </BottomSheetModalProvider>
          </PortalProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
