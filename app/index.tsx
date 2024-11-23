import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

export default function HomeScreen() {
  const [fonts] = useFonts({
    'Geist-Regular': require('@/assets/fonts/Geist-Regular.otf'),
    'Geist-Bold': require('@/assets/fonts/Geist-Bold.otf'),
    'GeistMono-Regular': require('@/assets/fonts/GeistMono-Regular.otf'),
    'GeistMono-Bold': require('@/assets/fonts/GeistMono-Bold.otf'),
  })

  useEffect(() => {
    if (fonts) {
      SplashScreen.hideAsync()
    }
  }, [fonts])

  if (!fonts) {
    return null
  }

  return (
    <SafeAreaProvider>
      <View>
        <Text>SEX</Text>
      </View>
    </SafeAreaProvider>
  )
}
