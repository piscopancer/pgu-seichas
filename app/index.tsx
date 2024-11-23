import { initializeDb } from '@/db'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'

SplashScreen.preventAutoHideAsync()

export default function HomeScreen() {
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
    <View className='flex-1'>
      <Text className='font-sans text-4xl text-neutral-200'>Illustrator</Text>
      <BottomSheet>
        <BottomSheetView>
          <Text>XD</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  )
}
