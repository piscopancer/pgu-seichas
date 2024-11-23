import '@/assets/style.css'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className='flex-1 bg-neutral-950'>
        <GestureHandlerRootView>
          <Slot />
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
